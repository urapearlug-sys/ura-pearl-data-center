'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { uraDailyPearlCoins, uraTreasuryCounter } from '@/images';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';

interface WalletProps {
  setCurrentView: (view: string) => void;
  embedded?: boolean;
}

type PearlType = 'white' | 'goldish';

export default function Wallet({ setCurrentView, embedded = false }: WalletProps) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [white, setWhite] = useState(0);
  const [bluePending, setBluePending] = useState(0);
  const [golden, setGolden] = useState(0);
  const [history, setHistory] = useState<Array<{ id: string; eventType?: string; createdAt: string; amount?: number | null }>>([]);

  const [convertFromType, setConvertFromType] = useState<'white' | 'blue'>('white');
  const [convertFromAmount, setConvertFromAmount] = useState('50');
  const [converting, setConverting] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('1');
  const [withdrawing, setWithdrawing] = useState(false);

  const [sendRecipientTelegramId, setSendRecipientTelegramId] = useState('');
  const [sendPearlType, setSendPearlType] = useState<PearlType>('white');
  const [sendAmount, setSendAmount] = useState('1');
  const [sending, setSending] = useState(false);
  const [transferTab, setTransferTab] = useState<'send' | 'receive' | 'history' | 'recent'>('send');

  const [myTelegramId, setMyTelegramId] = useState('');

  const totalPearls = white + bluePending + golden;
  const convertInput = Math.max(0, Math.floor(Number(convertFromAmount) || 0));
  const convertOutput = convertInput;

  const canConvert = useMemo(() => {
    if (convertFromType === 'white') return convertInput >= 1 && convertInput <= white;
    return convertInput >= 1 && convertInput <= bluePending;
  }, [convertFromType, convertInput, white, bluePending]);

  const loadWallet = async () => {
    if (!userTelegramInitData) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pearls/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: userTelegramInitData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load wallet');
      setWhite(Math.floor(data?.balances?.white ?? 0));
      setBluePending(Math.floor(data?.balances?.bluePending ?? 0));
      setGolden(Math.floor(data?.balances?.goldish ?? 0));
      setHistory(data?.recentAudits ?? []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load wallet', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTelegramInitData]);

  useEffect(() => {
    if (!userTelegramInitData) return;
    try {
      const params = new URLSearchParams(userTelegramInitData);
      const userRaw = params.get('user');
      if (!userRaw) return;
      const parsed = JSON.parse(decodeURIComponent(userRaw)) as { id?: number | string };
      if (parsed?.id != null) setMyTelegramId(String(parsed.id));
    } catch {
      // Ignore parse issues; receive section still shows instruction.
    }
  }, [userTelegramInitData]);

  const handleConvert = async () => {
    if (!userTelegramInitData || !canConvert) return;
    setConverting(true);
    try {
      const swapType = convertFromType === 'white' ? 'white_to_blue' : 'blue_to_white';
      const res = await fetch('/api/pearls/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          swapType,
          amount: convertInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');
      showToast('Swap successful', 'success');
      await loadWallet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Swap failed', 'error');
    } finally {
      setConverting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!userTelegramInitData) return;
    const amount = Math.max(0, Math.floor(Number(withdrawAmount) || 0));
    if (amount <= 0) {
      showToast('Enter valid withdrawal amount', 'error');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch('/api/pearls/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          goldishAmount: amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal request failed');
      showToast('Withdrawal request submitted', 'success');
      await loadWallet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Withdrawal request failed', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSend = async () => {
    if (!userTelegramInitData) return;
    const amount = Math.max(0, Math.floor(Number(sendAmount) || 0));
    if (!sendRecipientTelegramId.trim() || amount <= 0) {
      showToast('Fill recipient Telegram ID and amount', 'error');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/pearls/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          recipientTelegramId: sendRecipientTelegramId.trim(),
          amount,
          pearlType: sendPearlType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');
      showToast('Pearls sent successfully', 'success');
      setSendAmount('1');
      await loadWallet();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Transfer failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const onCopyReceiveId = async () => {
    triggerHapticFeedback(window);
    if (!myTelegramId) {
      showToast('Telegram ID not available yet', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(myTelegramId);
      showToast('Telegram ID copied', 'success');
    } catch {
      showToast('Could not copy Telegram ID', 'error');
    }
  };

  const transferTabs: Array<{ key: 'send' | 'receive' | 'history' | 'recent'; label: string }> = [
    { key: 'send', label: 'Send' },
    { key: 'receive', label: 'Receive' },
    { key: 'history', label: 'My History' },
    { key: 'recent', label: 'Recent' },
  ];

  return (
    <div className={embedded ? '' : 'bg-black flex justify-center min-h-screen'}>
      <div className={embedded ? 'w-full text-white flex flex-col' : 'w-full bg-black text-white flex flex-col max-w-xl pb-24'}>
        <div className={embedded ? 'space-y-4' : 'px-4 pt-4 space-y-4'}>
          <h1 className="text-2xl font-bold text-center">My Assets</h1>

          <div className="rounded-3xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Assets</p>
                <p className="mt-2 text-5xl font-bold leading-none tabular-nums">{totalPearls.toLocaleString()}</p>
                <p className="text-lg text-gray-300 mt-1">Pearls</p>
              </div>
              <Image src={uraTreasuryCounter} alt="Treasury pearls" width={88} height={88} className="h-20 w-20 object-contain" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] py-3 text-center"
            >
              <p className="text-[13px] font-semibold">{withdrawing ? 'Submitting...' : 'Withdraw'}</p>
            </button>
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting || !canConvert}
              className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] py-3 text-center disabled:opacity-60"
            >
              <p className="text-[13px] font-semibold">{converting ? 'Converting...' : 'Swap'}</p>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setCurrentView('airdrop');
              }}
              className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] py-3 text-center"
            >
              <p className="text-[13px] font-semibold">Airdrop</p>
            </button>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">Balances</h2>
            {[
              { code: 'WHITE', name: 'White Pearl', value: white },
              { code: 'BLUE', name: 'Blue Pearl (Pending)', value: bluePending },
              { code: 'GOLDEN', name: 'Golden Pearl', value: golden },
            ].map((item) => (
              <div key={item.code} className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] px-3 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Image src={uraDailyPearlCoins} alt={item.name} width={40} height={40} className="h-10 w-10 object-contain" />
                  <div className="min-w-0">
                    <p className="font-semibold">{item.code}</p>
                    <p className="text-sm text-gray-400 truncate">{item.name}</p>
                  </div>
                </div>
                <p className="text-2xl font-semibold tabular-nums">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] p-4">
            <h2 className="text-base font-bold">Swap</h2>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <label className="rounded-xl border border-[#3a3d42] bg-[#1f2229] p-2">
                <span className="text-[11px] text-gray-400">From</span>
                <select
                  value={convertFromType}
                  onChange={(e) => setConvertFromType(e.target.value as 'white' | 'blue')}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                >
                  <option value="white" className="bg-[#1f2229]">White Pearl</option>
                  <option value="blue" className="bg-[#1f2229]">Blue Pearl</option>
                </select>
              </label>
              <label className="rounded-xl border border-[#3a3d42] bg-[#1f2229] p-2">
                <span className="text-[11px] text-gray-400">Amount</span>
                <input
                  type="number"
                  min={0}
                  value={convertFromAmount}
                  onChange={(e) => setConvertFromAmount(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm outline-none"
                />
              </label>
            </div>
            <p className="text-sm mt-2 text-gray-300">
              To: <span className="font-semibold text-white">{convertFromType === 'white' ? 'Blue Pearl' : 'White Pearl'}</span>
            </p>
            <p className="text-lg font-bold tabular-nums">{convertOutput.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400">
              Rate: 1 {convertFromType === 'white' ? 'White' : 'Blue'} = 1 {convertFromType === 'white' ? 'Blue' : 'White'}
            </p>
          </section>

          <section className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] p-4">
            <h2 className="text-3xl font-bold leading-tight">Send & Receive ALM</h2>

            <div className="mt-4 rounded-2xl border border-[#2d2f38] bg-[#171b24] p-1 grid grid-cols-4 gap-1">
              {transferTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setTransferTab(tab.key);
                  }}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    transferTab === tab.key
                      ? 'bg-[#f3ba2f] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#2d2f38] bg-[#222731] p-4">
              {transferTab === 'send' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-4xl md:text-[34px] font-semibold text-[#a2a8b3] leading-none">Recipient Telegram ID</p>
                    <div className="mt-3 rounded-2xl border border-[#3c424f] bg-[#1a1f28] px-5 py-4">
                      <input
                        type="text"
                        value={sendRecipientTelegramId}
                        onChange={(e) => setSendRecipientTelegramId(e.target.value)}
                        className="w-full bg-transparent text-[38px] leading-none font-semibold text-[#aab1bc] outline-none"
                        placeholder="e.g. 123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-4xl md:text-[34px] font-semibold text-[#a2a8b3] leading-none">Amount (ALM)</p>
                    <div className="mt-3 rounded-2xl border border-[#3c424f] bg-[#1a1f28] px-5 py-4">
                      <input
                        type="number"
                        min={1}
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="w-full bg-transparent text-[38px] leading-none font-semibold text-[#aab1bc] outline-none"
                        placeholder="500.00K - 10.00M"
                      />
                    </div>
                    <p className="text-xl text-gray-400 mt-2">Min 1 ALM. Send by Telegram ID.</p>
                  </div>

                  <label className="block rounded-xl border border-[#3a3d42] bg-[#1f2229] p-3">
                    <span className="text-sm text-gray-400">Asset</span>
                    <select
                      value={sendPearlType}
                      onChange={(e) => setSendPearlType(e.target.value as PearlType)}
                      className="mt-1 w-full bg-transparent text-lg outline-none"
                    >
                      <option value="white" className="bg-[#1f2229]">White Pearl</option>
                      <option value="goldish" className="bg-[#1f2229]">Golden Pearl</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full rounded-2xl bg-[#f3ba2f] text-black py-3 text-lg font-semibold disabled:opacity-60"
                  >
                    {sending ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              )}

              {transferTab === 'receive' && (
                <div className="space-y-3">
                  <p className="text-xl text-gray-300">Receive using your Telegram ID.</p>
                  <div className="rounded-2xl border border-[#3c424f] bg-[#1a1f28] px-5 py-4">
                    <p className="text-sm text-gray-400">Your Telegram ID</p>
                    <p className="text-3xl font-semibold mt-1">{myTelegramId || 'Not detected yet'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onCopyReceiveId}
                    className="w-full rounded-2xl border border-[#5fa8ff] py-3 text-lg font-semibold text-[#9fc9ff]"
                  >
                    Copy Telegram ID
                  </button>
                </div>
              )}

              {transferTab === 'history' && (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="text-sm rounded-lg border border-[#3a3d42] bg-[#1f2229] px-3 py-2 flex items-center justify-between gap-2">
                      <span className="text-gray-300 truncate">{h.eventType || 'EVENT'}</span>
                      <span className="text-white tabular-nums">{Math.floor(h.amount || 0)}</span>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-sm text-gray-400">No history yet.</p>}
                </div>
              )}

              {transferTab === 'recent' && (
                <div className="space-y-2">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="text-sm rounded-lg border border-[#3a3d42] bg-[#1f2229] px-3 py-2 flex items-center justify-between gap-2">
                      <span className="text-gray-300 truncate">{h.eventType || 'EVENT'}</span>
                      <span className="text-white tabular-nums">{Math.floor(h.amount || 0)}</span>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-sm text-gray-400">No recent records.</p>}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#2d2f38] bg-gradient-to-r from-[#26282f] via-[#2f3033] to-[#25272d] p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">History</h2>
              {loading ? <span className="text-xs text-gray-400">Loading...</span> : null}
            </div>
            <div className="mt-2 space-y-1.5">
              {history.slice(0, 6).map((h) => (
                <div key={h.id} className="text-xs rounded-lg border border-[#3a3d42] bg-[#1f2229] px-2 py-1.5 flex items-center justify-between gap-2">
                  <span className="text-gray-300 truncate">{h.eventType || 'EVENT'}</span>
                  <span className="text-white tabular-nums">{Math.floor(h.amount || 0)}</span>
                </div>
              ))}
              {!loading && history.length === 0 ? (
                <p className="text-xs text-gray-400">No transactions yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
