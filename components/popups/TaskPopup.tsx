// components/popups/TaskPopup.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';
import { getTaskImageSrc } from '@/images';
import { useHydration } from '@/utils/useHydration';
import { TASK_WAIT_TIME } from '@/utils/consts';
import { useToast } from '@/contexts/ToastContext';
import { TaskPopupProps } from '@/utils/types';

const NO_ANSWER_VERIFICATION_NOTE = 'The system will run verification now, process payout and will do one more verification follow up to ensure compliance.';

const TaskPopup: React.FC<TaskPopupProps> = React.memo(({ task, onClose, onUpdate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const showToast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { userTelegramInitData, incrementPoints, setPoints, setPointsBalance } = useGameStore();
  const isHydrated = useHydration();
  const [localTask, setLocalTask] = useState(task);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [redeemCodeInput, setRedeemCodeInput] = useState('');

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    try {
      triggerHapticFeedback(window);
      const response = await fetch('/api/tasks/update/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: userTelegramInitData,
          taskId: localTask.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }

      const data = await response.json();
      const updatedTask = {
        ...localTask,
        taskStartTimestamp: new Date(data.taskStartTimestamp),
      };
      setLocalTask(updatedTask);
      onUpdate(updatedTask);
      showToast('Task started successfully!', 'success');

      // Open the link in a new window if it's a VISIT task and has a link
      if (localTask.type === 'VISIT' && localTask.taskData.link) {
        window.open(localTask.taskData.link, '_blank');
      }
    } catch (error) {
      console.error('Error starting task:', error);
      showToast('Failed to start task. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [localTask, userTelegramInitData, onUpdate, showToast]);

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      triggerHapticFeedback(window);
      let response;
      if (localTask.type === 'VISIT') {
        const correctAnswer = localTask.taskData?.correctAnswer?.trim();
        if (correctAnswer && !answerInput.trim()) {
          showToast('Please enter your answer after watching the video.', 'error');
          setIsLoading(false);
          return;
        }
        response = await fetch('/api/tasks/check/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
            taskId: localTask.id,
            answer: answerInput.trim() || undefined,
          }),
        });
      } else if (localTask.type === 'REFERRAL') {
        response = await fetch('/api/tasks/check/referral', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
            taskId: localTask.id,
          }),
        });
      } else if (localTask.type === 'TELEGRAM') {
        response = await fetch('/api/tasks/check/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
            taskId: localTask.id,
          }),
        });
      } else if (localTask.type === 'REDEEM_CODE') {
        if (!redeemCodeInput.trim()) {
          showToast('Please enter your code.', 'error');
          setIsLoading(false);
          return;
        }
        response = await fetch('/api/tasks/check/redeem-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
            taskId: localTask.id,
            code: redeemCodeInput.trim(),
          }),
        });
      } else {
        throw new Error(`Unsupported task type: ${localTask.type}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || `Failed to check ${localTask.type} task`;
        showToast(msg, 'error');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        const updatedTask = { ...localTask, isCompleted: data.isCompleted };
        setLocalTask(updatedTask);
        onUpdate(updatedTask);
        const reward = data.reward ?? localTask.points ?? 0;
        if (typeof data.points === 'number' && typeof data.pointsBalance === 'number') {
          setPoints(data.points);
          setPointsBalance(data.pointsBalance);
        } else {
          incrementPoints(reward);
        }
        showToast(data.message || 'Task completed successfully!', 'success');
        notifyPearlBalancesRefresh();
      } else {
        if (localTask.type === 'REFERRAL' && data.currentReferrals !== undefined && data.requiredReferrals !== undefined) {
          const remainingReferrals = data.requiredReferrals - data.currentReferrals;
          showToast(`You need ${remainingReferrals} more referral${remainingReferrals > 1 ? 's' : ''} to complete this task. (${data.currentReferrals}/${data.requiredReferrals})`, 'error');
        } else {
          showToast(data.message || `Failed to complete ${localTask.type} task. Please try again.`, 'error');
        }
      }
    } catch (error) {
      console.error('Error checking task:', error);
      showToast(error instanceof Error ? error.message : `Failed to check ${localTask.type} task. Please try again.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = useCallback(() => {
    if (!localTask.taskStartTimestamp) return null;
    const now = new Date();
    const startTime = new Date(localTask.taskStartTimestamp);
    const elapsedTime = now.getTime() - startTime.getTime();
    const remainingTime = Math.max(TASK_WAIT_TIME - elapsedTime, 0);
    return remainingTime;
  }, [localTask.taskStartTimestamp]);

  const formatTime = useCallback((ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isHydrated && localTask.taskStartTimestamp && !localTask.isCompleted) {
      const updateTimer = () => {
        const remaining = getTimeRemaining();
        setTimeRemaining(remaining);
        if (remaining === 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setLocalTask({ ...localTask }); // Trigger re-render when timer reaches 0
          setIsTimerFinished(true);
        } else {
          setIsTimerFinished(false);
        }
      };

      updateTimer(); // Call immediately to set initial time
      intervalRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isHydrated, localTask, getTimeRemaining]);

  const handleClose = () => {
    triggerHapticFeedback(window);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280); // Match this to the animation duration
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className={`bg-[#272a2f] rounded-t-3xl p-6 w-full max-w-xl ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="flex justify-between items-center mb-4 gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors shrink-0"
            aria-label="Back"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </button>
          <h2 className="text-xl sm:text-2xl text-white text-center font-bold truncate flex-1 min-w-0">{localTask.title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {(() => {
          const imgSrc = getTaskImageSrc(localTask.image);
          return imgSrc ? (
            <Image src={imgSrc} alt={localTask.title} width={80} height={80} className="mx-auto mb-4 rounded-lg object-contain" />
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-[#272a2f] flex items-center justify-center">
              <IceCube className="w-10 h-10 text-[#f3ba2f]" />
            </div>
          );
        })()}
        <p className="text-gray-300 text-center mb-4">{localTask.description}</p>
        {localTask.type === 'REFERRAL' && localTask.taskData?.friendsNumber != null && (
          <p className="text-sm text-[#f3ba2f] font-medium text-center mb-3">
            Number of friends (required): {Number(localTask.taskData.friendsNumber)} — invite them to get the reward
          </p>
        )}
        {localTask.type === 'VISIT' && (
          <>
            <p className="text-sm text-gray-400 text-center mb-3">
              {localTask.taskData?.correctAnswer
                ? 'When you tap Start, the link opens and a short wait begins. Watch the video, then when the timer ends enter the answer below and tap Check to claim your reward.'
                : 'When you tap Start, the link opens and a short wait begins. Watch the video, then when the timer ends tap Check to claim your reward.'}
            </p>
            <div className="text-sm text-amber-200/90 text-center mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              {localTask.taskData?.correctAnswer
                ? 'Reasonable watch time is required and verified. The answer is 1 or 2 words shown in the video — look for the ★ or highlighted text.'
                : NO_ANSWER_VERIFICATION_NOTE}
            </div>
          </>
        )}
        {localTask.taskData?.link && (
          <div className="flex justify-center mb-4">
            <button
              className="w-fit px-6 py-3 text-xl font-bold bg-blue-500 text-white rounded-2xl"
              onClick={() => {
                triggerHapticFeedback(window);
                window.open(localTask.taskData.link, '_blank');
              }}
            >
              {localTask.type === 'REDEEM_CODE' ? 'Attend' : localTask.callToAction}
            </button>
          </div>
        )}
        <div className="flex justify-center items-center mb-4">
          <IceCube className="w-6 h-6" />
          <span className="text-white font-bold text-2xl ml-1">+{formatNumber(localTask.points)}</span>
        </div>
        {localTask.type === 'VISIT' && localTask.taskData?.correctAnswer && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Your answer (from the video — required to claim)</label>
            <input
              type="text"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="Enter the answer from the video"
              className="w-full bg-[#1d2025] border border-[#3d4046] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#f3ba2f] focus:outline-none"
              autoComplete="off"
            />
          </div>
        )}
        {localTask.type === 'REDEEM_CODE' && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Code</label>
            <input
              type="text"
              value={redeemCodeInput}
              onChange={(e) => setRedeemCodeInput(e.target.value)}
              placeholder="Enter the code"
              className="w-full bg-[#1d2025] border border-[#3d4046] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#f3ba2f] focus:outline-none"
              autoComplete="off"
            />
          </div>
        )}
        {localTask.type === 'VISIT' ? (
          <button
            className={`w-full py-6 text-xl font-bold text-white rounded-2xl flex items-center justify-center ${isLoading || localTask.isCompleted || (localTask.taskStartTimestamp && !isTimerFinished) || (localTask.taskData?.correctAnswer && !answerInput.trim() && localTask.taskStartTimestamp && isTimerFinished)
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-500'
              }`}
            onClick={localTask.taskStartTimestamp ? (isTimerFinished ? handleCheck : undefined) : handleStart}
            disabled={Boolean(isLoading || localTask.isCompleted || (localTask.taskStartTimestamp && !isTimerFinished) || (localTask.taskData?.correctAnswer && !answerInput.trim() && localTask.taskStartTimestamp && isTimerFinished))}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : localTask.isCompleted ? (
              'Completed'
            ) : localTask.taskStartTimestamp ? (
              isHydrated ? (timeRemaining === 0 ? 'Check' : formatTime(timeRemaining || 0)) : 'Loading...'
            ) : (
              'Start'
            )}
          </button>
        ) : localTask.type === 'REDEEM_CODE' ? (
          <button
            className={`w-full py-6 text-xl font-bold text-white rounded-2xl flex items-center justify-center ${isLoading || localTask.isCompleted || !redeemCodeInput.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500'}`}
            onClick={handleCheck}
            disabled={isLoading || localTask.isCompleted || !redeemCodeInput.trim()}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : localTask.isCompleted ? (
              'Completed'
            ) : (
              localTask.callToAction || 'Redeem code'
            )}
          </button>
        ) : (
          <button
            className="w-full py-6 text-xl font-bold bg-green-500 text-white rounded-2xl flex items-center justify-center"
            onClick={handleCheck}
            disabled={isLoading || localTask.isCompleted}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            ) : localTask.isCompleted ? (
              'Completed'
            ) : (
              'Check'
            )}
          </button>
        )}
      </div>
    </div>
  );
});

TaskPopup.displayName = 'TaskPopup';

export default TaskPopup;