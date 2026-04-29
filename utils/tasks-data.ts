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


export const earnData = [
    {
      category: "Special",
      tasks: [
        {
          title: "Set Up Telegram Mini App Clicker Game",
          points: 5000,
          image: "youtube",
          description: "In this guide, I'll show you how to set up a Next.js 14 project as a Telegram Mini App clicker game.",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://youtu.be/OYcqPL1HSTo?si=Fc2zb4lS0d7VUHlR"
          },
          isActive: true  
        },
        {
          title: "How to Make a Hamster Kombat Clone",
          points: 5000,
          image: "youtube",
          description: "In this video, you'll be guided through the process of creating a clone of the famous Hamster Kombat app.",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://youtu.be/luAn3BlI4go?si=nKvs72-7_WVItXZo"
          },
          isActive: true  
        },
        {
          title: "How to Make a Notcoin Clone",
          points: 5000,
          image: "youtube",
          description: "In this video, you'll be guided through the process of creating a clone of the famous Notcoin app.",
          callToAction: "Watch video",
          type: "VISIT",
          taskData: {
            link: "https://youtu.be/TxArGoG9YMA?si=iYofFT70PKuAMnrV"
          },
          isActive: true  
        },
        {
          title: "Zoom event reward",
          points: 5000,
          image: "zoom",
          description: "Attended our Zoom call? Enter the code shared during the event to claim your reward.",
          callToAction: "Redeem code",
          type: "REDEEM_CODE",
          taskData: {
            validCodes: ["ZOOM2025"],
            link: "https://zoom.us/j/your-meeting-id"
          },
          isActive: true
        },
      ]
    },
    {
      category: "Leagues",
      tasks: [
        {
          title: "Join Clicker Game News / Updates",
          points: 5000,
          image: "telegram",
          description: "Stay updated with the latest news and announcements by joining Clicker News Telegram channel.",
          callToAction: "Join channel",
          type: "TELEGRAM",
          taskData: {
            link: "https://t.me/clicker_game_news",
            chatId: "clicker_game_news"
          },
          isActive: true  
        },
        {
          title: "Follow Nikandr's X",
          points: 5000,
          image: "twitter",
          description: "Follow me on X (formerly Twitter) for real-time updates and community engagement.",
          callToAction: "Follow on X",
          type: "VISIT",
          taskData: {
            link: "https://x.com/NikandrSurkov"
          },
          isActive: true  
        },
      ]
    },
    {
      category: "Refs",
      tasks: [
        {
          title: "Invite 3 friends",
          points: 25000,
          image: "friends",
          description: "Invite your friends to join the Ice community and earn bonus points for each successful referral.",
          callToAction: "Invite friends",
          type: "REFERRAL",
          taskData: {
            friendsNumber: 3
          },
          isActive: true  
        }
      ]
    },
  ];