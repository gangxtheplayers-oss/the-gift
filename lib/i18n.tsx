'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isZh: boolean;
}

const UI_STRINGS = {
  // Navigation & Header
  brandTitle: {
    en: 'Forever & Always',
    zh: '执子之手 · 与子偕老',
  },
  forPartner: {
    en: 'for {name}',
    zh: '致我最爱的 {name}',
  },
  daysTogetherCounter: {
    en: 'Our Journey: {days} days of loving you',
    zh: '相守岁月：已爱你的第 {days} 天',
  },
  liveTimeElapsed: {
    en: '{days}d {hours}h {minutes}m {seconds}s',
    zh: '{days}天 {hours}时 {minutes}分 {seconds}秒',
  },
  tabJourney: {
    en: 'Journey',
    zh: '星轨旅程',
  },
  tabLetter: {
    en: 'Love Letter',
    zh: '深情信笺',
  },
  tabMemories: {
    en: 'Memories',
    zh: '珍藏回忆',
  },
  tabReasons: {
    en: 'Love Jar',
    zh: '心动便签',
  },
  tabRoasts: {
    en: 'Fortnite & Roasts',
    zh: '双排日常 & 互损',
  },
  unlockedBadge: {
    en: 'Unlocked',
    zh: '已解锁',
  },
  lockTooltip: {
    en: 'Click to Lock Edits',
    zh: '点击重新加锁',
  },
  personalizeBtn: {
    en: 'Personalize',
    zh: '个性化定制',
  },
  personalizeGiftBtn: {
    en: 'Personalize Gift',
    zh: '编辑定制',
  },

  // Unwrap Experience
  giftFromTheHeart: {
    en: 'A Gift From The Heart',
    zh: '来自心底的专属之礼',
  },
  toMyFavoritePlayer: {
    en: 'To My Favorite Player & Soulmate',
    zh: '致我最心爱的双排队友与灵魂伴侣',
  },
  tapToBreakSeal: {
    en: 'Tap to break the seal & unwrap',
    zh: '轻触火漆印，启封专属浪漫',
  },
  unwrapSubtext: {
    en: 'A special sanctuary crafted just for you, celebrating every moment, laugh, and clutch we have shared.',
    zh: '为你专属打造的数字浪漫空间，记录着我们共同经历的每一次心跳、欢笑与绝地翻盘。',
  },
  openLetterBtn: {
    en: 'Open Letter',
    zh: '拆开信笺',
  },

  // Journey & Milestones
  starlitJourneyTag: {
    en: 'Our Starlit Journey',
    zh: '星光旅途',
  },
  journeyTitle: {
    en: 'The Journey of Us',
    zh: '我们的故事星轨',
  },
  journeySubtitle: {
    en: 'Every star in this sky marks a moment that bonded our souls forever. Tap or drag each star to explore and customize.',
    zh: '漫漫夜空中的每一颗星，都铭刻着让我们灵魂相融的瞬间。轻点或拖动每颗星辰，重温属于我们的专属时刻。',
  },
  doneEditingSky: {
    en: 'Done Editing Sky',
    zh: '完成星空编辑',
  },
  editJourney: {
    en: 'Edit Journey',
    zh: '编辑旅程',
  },
  editJourneyLocked: {
    en: 'Edit Journey (Locked)',
    zh: '编辑旅程（已锁定）',
  },
  skyMapView: {
    en: 'Sky Map',
    zh: '星空全景',
  },
  timelineView: {
    en: 'Timeline',
    zh: '时光足迹',
  },
  skyTipEditing: {
    en: 'Tip: Drag stars to shape your journey • Click empty sky to add a star',
    zh: '提示：拖动星辰编织专属星轨 • 点击夜空空白处可添加新坐标',
  },
  skyTipBrowsing: {
    en: 'Click on any star to reveal our story • Tap "Edit Journey" to move or add stars',
    zh: '点击任意星辰揭晓我们的故事 • 点击“编辑旅程”可添加或移动星辰',
  },
  editJourneyMilestoneModal: {
    en: 'Edit Journey Milestone',
    zh: '编辑旅程里程碑',
  },
  milestoneTitleLabel: {
    en: 'Star Title / Milestone Name',
    zh: '里程碑标题 / 纪念主题',
  },
  milestoneDateLabel: {
    en: 'Date / Time',
    zh: '纪念日期 / 时刻',
  },
  milestoneDescLabel: {
    en: 'Story / Memory Note',
    zh: '故事回忆 / 心动记录',
  },
  saveMilestoneBtn: {
    en: 'Save Milestone',
    zh: '保存里程碑',
  },
  deleteMilestoneBtn: {
    en: 'Delete Star',
    zh: '删除此星辰',
  },
  closeBtn: {
    en: 'Close',
    zh: '关闭',
  },
  cancelBtn: {
    en: 'Cancel',
    zh: '取消',
  },

  // Love Letter
  letterToHeader: {
    en: 'To the one who holds my heart',
    zh: '致我一生所爱',
  },
  sealedWithLoveDate: {
    en: 'Sealed with love • {date}',
    zh: '深情封存 • {date}',
  },
  candlelightToggle: {
    en: 'Soft Candlelight',
    zh: '温馨烛光',
  },
  goldFoilToggle: {
    en: 'Gold Foil Ink',
    zh: '鎏金笔触',
  },
  sealedBySender: {
    en: 'Sealed by {sender}',
    zh: '署名：{sender}',
  },
  foreverAndAlwaysScript: {
    en: 'Forever & Always',
    zh: '执子之手 · 与子偕老',
  },

  // Memories & Gallery
  memoriesTag: {
    en: 'Game Shots & Captured Moments',
    zh: '高光战报与甜蜜瞬间',
  },
  memoriesTitle: {
    en: 'Our Screenshot & Memory Sanctuary',
    zh: '游戏截图与回忆相册',
  },
  memoriesSubtitle: {
    en: 'Drag and drop your Fortnite duo clutch moments, late night IG chat snippets, or photos directly onto the wall. Click any card to inspect in full HD.',
    zh: '记录我们双排吃鸡的高光时刻，与深夜聊天的甜蜜点滴。直接拖拽截图或合照到相册墙，点击卡片可查看高清大图。',
  },
  fitFullDimension: {
    en: 'Full Dimension (Uncropped)',
    zh: '完整原图画幅 (无裁剪)',
  },
  fitClassicFrame: {
    en: 'Classic Frame',
    zh: '经典质感相框',
  },
  addEditAlbum: {
    en: 'Add / Edit Album',
    zh: '添加 / 管理照片',
  },
  albumProtected: {
    en: 'Album (Protected)',
    zh: '相册（已保护）',
  },
  dropZonePlaceholder: {
    en: 'Drag & Drop Fortnite Screenshots or Photos here',
    zh: '拖拽堡垒之夜战报截图或恋爱合照至此',
  },
  dropZoneSubtext: {
    en: 'Supports PNG, JPG, WebP up to 10MB • Auto-optimized',
    zh: '支持 PNG、JPG、WebP，最大 10MB • 自动高清优化',
  },
  browseFilesBtn: {
    en: 'Browse Files',
    zh: '浏览本地文件',
  },
  clickToEnlarge: {
    en: 'Click card to view in HD',
    zh: '点击卡片查看高清大图',
  },

  // Love Jar
  loveJarTitle: {
    en: 'The Reasons Jar',
    zh: '爱你的无尽理由',
  },
  loveJarSubtitle: {
    en: 'A jar of handwritten notes reminding you why you are the love of my life. Pick one whenever you need a smile.',
    zh: '装满手写便签的浪漫心动盲盒，提醒你为什么是我这辈子最坚定的人选。无论何时想我了，就拆开一张看吧。',
  },
  pickReasonBtn: {
    en: 'Pick a Reason from the Jar',
    zh: '从盲盒中抽取便签',
  },
  openAnotherNoteBtn: {
    en: 'Open Another Note',
    zh: '再拆一张纸条',
  },
  allReasonsCat: {
    en: 'All Reasons',
    zh: '全部理由',
  },
  catCuteHabits: {
    en: 'Cute Habits',
    zh: '可爱习惯',
  },
  catSoulHeart: {
    en: 'Soul & Heart',
    zh: '灵魂共鸣',
  },
  catComfortPeace: {
    en: 'Comfort & Peace',
    zh: '温柔依靠',
  },
  catOurFuture: {
    en: 'Our Future',
    zh: '携手未来',
  },
  reasonPrefix: {
    en: 'Reason #{num}',
    zh: '第 {num} 条心动理由',
  },

  // Fortnite Banter & Duo Roasts
  duoRoastsTitle: {
    en: 'Duo Chronicles & Affectionate Roasts',
    zh: '双排战报与甜蜜互损',
  },
  duoRoastsSubtitle: {
    en: 'Because true love is rebooting you 4 times in one match, surviving on 12 HP, and still giving you the last Med Mist.',
    zh: '真正的浪漫，就是一局游戏去重启车捞你四次，自己残血打绷带，却依然把最后一瓶医疗喷雾塞进你怀里。',
  },
  duoStatTracker: {
    en: 'Duo Stat Tracker',
    zh: '双排羁绊数据',
  },
  statVictoryRoyales: {
    en: 'Victory Royales',
    zh: '双排吃鸡胜场',
  },
  statReboots: {
    en: 'Reboots Performed',
    zh: '救赎拉人次数',
  },
  statChugStolen: {
    en: 'Chug Jugs Stolen',
    zh: '顺走大灌桶次数',
  },
  statSynergy: {
    en: 'Duo Synergy Rating',
    zh: '绝配默契评分',
  },
  situationLabel: {
    en: 'Situation',
    zh: '犯罪现场还原',
  },
  verdictLabel: {
    en: 'Verdict',
    zh: '法庭亲昵判决',
  },
  damageReportBtn: {
    en: 'Damage Report',
    zh: '战损检讨',
  },
  admitGuiltBtn: {
    en: 'Admit Guilt',
    zh: '含泪认罪',
  },
  guiltyConfirmed: {
    en: 'Guilty 🤍',
    zh: '已认罪 🤍',
  },
  witnessedBtn: {
    en: 'Witnessed',
    zh: '投一票认定',
  },
  votesCount: {
    en: '{count} Votes',
    zh: '{count} 票认证',
  },

  // Password Modal
  protectedSanctuaryTitle: {
    en: 'Protected Gift Sanctuary',
    zh: '守护专属恋爱空间',
  },
  passcodeDesc: {
    en: 'This anniversary website is locked so its love letter, milestones, photos, and words cannot be accidentally edited or ruined. Enter the secret passcode to unlock editing.',
    zh: '本纪念网站已启用安全保护，防止珍贵的情书、时光足迹、照片和回忆被误改。请输入专属密钥解锁编辑。',
  },
  enterSecretPasscode: {
    en: 'Enter secret passcode...',
    zh: '请输入专属密钥...',
  },
  unlockSanctuaryBtn: {
    en: 'Unlock Sanctuary',
    zh: '解除锁定',
  },
  incorrectPasscodeMsg: {
    en: 'Incorrect passcode. Please try again with love.',
    zh: '密钥不正确，请重新输入 🤍',
  },

  // Footer
  footerCraftedWithLove: {
    en: 'Crafted with endless love for {name}. In a universe of infinite stars, you are my only home.',
    zh: '为你用心打造，致我唯一的 {name}。浩瀚宇宙星辰无数，唯有你是我的终点。',
  },
  reliveEnvelopeBtn: {
    en: 'Relive Opening Envelope',
    zh: '重温拆信仪式',
  },
  customizeFooterBtn: {
    en: 'Customize Details',
    zh: '自定义内容',
  },
  customizeFooterProtectedBtn: {
    en: 'Customize (Protected)',
    zh: '自定义（受保护）',
  },
};

// Chinese translations for the default story content so that the entire site feels 100% native
export const CHINESE_DEFAULTS = {
  loveLetter: {
    title: '第一关通关：1个月纪念日快乐',
    writtenDate: '为我们的1个月纪念日而写',
    content: `我最爱的宝贝：

你走进我的生活虽然才短短一个月，但回顾遇见你之前的日子，说实话，感觉从前的世界仿佛只是黑白的。

人们总说异地恋很苦，距离是一道难以逾越的高墙。但在我心里，只要有了你，千山万水都变得微不足道。每当 Instagram 亮起你的新消息，每当我们彻夜聊到凌晨四点、天南海北无话不谈，每当我们在游戏里组成所向披靡的双排队伍，我都觉得你比身边的任何人都更贴近我的心跳。

谢谢你带给我这不可思议的第一个月。谢谢你成为我最默契的专属双排搭档，谢谢那些深夜里我们谁也舍不得先说晚安的 IG 长聊，谢谢你愿意与我分享你的整个世界，也谢谢你总是毫不费力就让我笑逐颜开。

我们故事的第一关已经顺利通关啦！我迫不及待想和你开启接下来的每一个副本、每一场深夜开黑，以及所有关于未来的美好憧憬——直到我们终于跨越距离、我能真真切切把你拥入怀中的那一天。

1个月纪念日快乐，全宇宙我最心爱的姑娘。

永远做你的二号玩家，
永远属于你的我。`,
  },
  milestones: [
    {
      id: 'm-1',
      title: '初识：Instagram 上的第一条消息',
      date: '第 1 天 • 私信里的心动敲门',
      description: '我们在 Instagram 上发出第一条消息的那一刻。告别了客套与寒暄，惊喜地发现从第一天起，和彼此聊天竟然是如此轻松、温暖与自然。',
    },
    {
      id: 'm-2',
      title: '不谋而合的奇妙默契',
      date: '第 6 天 • 灵魂同频',
      description: '第一次在同一瞬间想到并说出完全一样的话。才发现我们的思维早在同一个频道上奇迹般同频，那一刻的心动火花至今难以忘怀。',
    },
    {
      id: 'm-3',
      title: '双排启航：专属二号玩家',
      date: '第 12 天 • 峡谷与战场的双排誓约',
      description: '从此不再匹配路人队友——从这一刻起，我们成为了彼此官方认证的专属双排搭档。极限拉人复活、互相照看后背、共享护盾与物资，深深发觉如果队伍里没有你，游戏便失去了所有的乐趣。',
    },
    {
      id: 'm-4',
      title: '彻夜畅聊：IG 上的不眠之夜',
      date: '第 20 天 • 搞笑视频、快拍与凌晨三点',
      description: '手机屏幕上 Instagram 消息提示几乎从未间断。互相分享搞笑短视频、回复每一条快拍、聊到凌晨三点依然舍不得互道晚安，因为告别真的太难了。',
    },
    {
      id: 'm-5',
      title: '彼此告白：爱意溢出屏幕',
      date: '第 28 天 • 袒露心声的那一刻',
      description: '心底的情愫再也无法仅仅停留在“普通朋友”或“开黑搭档”。隔着屏幕心跳如擂鼓，终于坦白了彼此在对方心中无可替代的分量，义无反顾地携手奔向彼此。',
    },
  ],
  memories: [
    {
      id: 'p-1',
      caption: '在虚拟世界里与你看星空',
      date: '虚拟日落观景台',
      note: '让两个游戏角色肩并肩坐在风景前看日落与星海。在任何虚拟世界里，身边的你永远都是最绝美的风景。',
    },
    {
      id: 'p-2',
      caption: '与我的专属搭档绝地翻盘吃鸡',
      date: '天梯排位冒险',
      note: '拿下最艰难的一场排位胜利！只要有你作为搭档在身后照看我，我的战斗力瞬间飙升一千倍。',
    },
    {
      id: 'p-3',
      caption: '深夜 IG 私信与共享歌单',
      date: '我们的数字避风港',
      note: '给彼此分享音乐链接、温馨好看的帖子，一起看着搞笑短视频嘻嘻哈哈直到凌晨三点。',
    },
    {
      id: 'p-4',
      caption: '肩并肩的游戏角色，心贴心的我们',
      date: '距离在爱面前微不足道',
      note: '数千公里的物理距离根本算不了什么，因为无论何时，你都真切地陪在我的每个日夜里。',
    },
  ],
  polaroids: [
    {
      id: 'p-1',
      caption: '在虚拟世界里与你看星空',
      date: '虚拟日落观景台',
      note: '两个游戏角色肩并肩坐在风景前看日落与星海。在任何虚拟世界里，身边的你永远都是最绝美的风景。',
    },
    {
      id: 'p-2',
      caption: '与我的专属搭档绝地翻盘吃鸡',
      date: '天梯排位冒险',
      note: '拿下最艰难的一场排位胜利！只要有你作为搭档在身后照看我，我的战斗力瞬间飙升一千倍。',
    },
    {
      id: 'p-3',
      caption: '深夜 IG 私信与共享歌单',
      date: '我们的数字避风港',
      note: '给彼此分享音乐链接、温馨好看的帖子，一起看着搞笑短视频嘻嘻哈哈直到凌晨三点。',
    },
    {
      id: 'p-4',
      caption: '肩并肩的游戏角色，心贴心的我们',
      date: '距离在爱面前微不足道',
      note: '数千公里的物理距离根本算不了什么，因为无论何时，你都真切地陪在我的每个日夜里。',
    },
  ],
  reasons: [
    {
      id: 'r-1',
      text: '每当我们游戏里发生爆笑名场面时，你那些可爱又真实的反应与消息。',
    },
    {
      id: 'r-2',
      text: '你总是那么温柔体贴，每时每刻都惦记着我有没有按时吃饭、有没有好好休息。',
    },
    {
      id: 'r-3',
      text: '每天清晨在 Instagram 上醒来就能看到你甜甜的早安问候，每晚又在你的消息里安心入睡。',
    },
    {
      id: 'r-4',
      text: '在 IG 私信里每当看到好笑的内容时，你狂发表情包和一长串乱码键入的可爱模样。',
    },
    {
      id: 'r-5',
      text: '整天在 Instagram 上无话不谈、互相分享好玩的视频与日常琐碎时，那种自然又舒心惬意的感觉。',
    },
    {
      id: 'r-6',
      text: '在游戏里你总是全心全意保护我，哪怕你自己也需要，却依然毫不犹豫把最好的物资扔给我。',
    },
    {
      id: 'r-7',
      text: '想到未来我们终于订好机票、在机场出站口相见、我终于能真实拥抱你的那一刻。',
    },
    {
      id: 'r-8',
      text: '你那些带着慵懒睡意的 IG 早安消息，总能在一瞬间点亮我一整天的心情。',
    },
    {
      id: 'r-9',
      text: '在地球上的80亿人与浩瀚的网络游戏世界中，我们竟然奇迹般地相遇并相爱了。',
    },
    {
      id: 'r-10',
      text: '在疲惫焦虑的一天过后，阅读你温柔暖心的消息，所有压力都会在一瞬间烟消云散。',
    },
    {
      id: 'r-11',
      text: '那些只有你和我心领神会、在深夜双排时创造的专属搞笑战友梗。',
    },
    {
      id: 'r-12',
      text: '憧憬着未来某一天，在属于我们自己的温馨公寓里，肩并肩打造专属于我们的双人电竞桌面。',
    },
    {
      id: 'r-13',
      text: '你每天给予我那份纯粹、笃定而毫无保留的深情与偏爱。',
    },
    {
      id: 'r-14',
      text: '深知无论此刻我们相隔多远，我们的两颗心始终在同一个节拍上同频共振。',
    },
  ],
  roasts: [
    {
      id: 'roast-1',
      title: '9点重炮霰弹枪惨案',
      badge: '瞄准命中率：2.1%',
      situation: '悄悄摸到一个挂机吃医疗包的敌人身后……你全神贯注地握紧鼠标，在键鼠操作台上屏息凝神瞄准准星，使出浑身力气按下左键——打出了高贵而清脆的9点伤害。',
      verdict: '然后你慌乱地在麦里尖叫：“他大残！他大残快拉我！！”',
    },
    {
      id: 'roast-2',
      title: '传说级大灌桶私吞大盗',
      badge: '认证大灌桶神偷',
      situation: '我标记了一个大灌桶，好让我们在零建造模式的下一场决赛圈存活。你立刻喝下两个小护盾药水顶到50甲，然后为了补缺少的2点血，当着我12滴血、0甲、只有两个灰色绷带的面，把长达15秒的大灌桶一个人全吨吨吨炫光了。',
      verdict: '事后当面对质时眨巴着无辜大眼睛：“哎呀我以为是给我的呢 :3 你可以吃这个小蘑菇或者打个绷带嘛！”',
    },
    {
      id: 'roast-3',
      title: '重力：你一生无法战胜的宿敌',
      badge: '高空坠落伤害皇室',
      situation: '我们在零建造模式进入前三支决赛圈队伍。整局游戏敌人的子弹一发都没碰到你。接着你试图滑铲滑下一座4英尺高的小草坡，手滑按错了键盘上的滑铲键，直接滑下悬崖摔成倒地状态。',
      verdict: '本赛季堡垒之夜零建造模式中，重力目前以 64 比 0 的战绩绝对碾压你。',
    },
    {
      id: 'roast-4',
      title: '零建造大平原无掩体狂奔',
      badge: '零掩体慌乱逃生',
      situation: '高处的敌方双排开始用精确射手步枪疯狂集火我们。因为我们玩的是零建造模式，根本没有板子可以搭，你一慌神开始在键盘上疯狂滚键盘，反向扔出了便携掩体，并在过载护盾彻底被打碎的同时，战术冲刺直接一头扎进了一棵坚硬的松树上。',
      verdict: '机械键盘的 RGB 灯效：满分10分极具美感。紧急零建造规避机动：0分。',
    },
    {
      id: 'roast-5',
      title: '横穿800米毒圈的复活卡环球巡游',
      badge: '战术复活卡小公主',
      situation: '在零建造最火热的跳点落地45秒内光速倒地成盒，把你的复活卡孤零零留在一对握着神话霰弹枪的狂暴对手正中间。',
      verdict: '我作为你搭档的专属使命：哪怕只剩3点血，也要穿越1000米毒圈战术冲刺，就为了把我最喜欢的姑娘重新带回游戏大厅。',
    },
    {
      id: 'roast-6',
      title: '草丛战术与掩体静修大师',
      badge: '0击败，100%小零食',
      situation: '在零建造模式下坚决不肯离开茂密的灌木丛，躲在岩石后整整14分钟，现实中一边美滋滋吃着小零食，一边每隔3分钟轻轻敲一下键盘防止被踢下线，静静等待其他人互相消灭。',
      verdict: '以0伤害输出、0枪开火的战绩荣获第二名，并提供拉满的情绪价值。',
    },
    {
      id: 'roast-7',
      title: '“他大残！”虚假雷达预警',
      badge: '报点“他大残”，到场发现十个猛男',
      situation: '你在零建造里倒地后在麦克风里声嘶力竭大喊：“他大残！他大残兄弟快冲他一滴血！！”',
      verdict: '我满怀希望滑铲冲进去，发现对面整整十个满血满过载盾猛男，端着神话霰弹枪，从四面八方用250点满血状态对我疯狂开火。',
    },
    {
      id: 'roast-8',
      title: '永远是我心中无可替代的第一双排搭档',
      badge: '名人堂终身专属搭档',
      situation: '就算你霰弹枪枪枪描边、按错键盘键位、抢走大灌桶、在空旷平原无掩体被抓……我也绝不会跟世界上任何其他人组队玩零建造。',
      verdict: '不管是落地成盒第100名，还是携手荣获 Victory Royale，用键鼠和你一起玩游戏，永远是我一天中最幸福的时光。永远做你的二号玩家。',
    },
  ],
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: () => '',
  isZh: false,
});

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('gift_app_lang');
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // safe catch
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('gift_app_lang', newLang);
    } catch {
      // safe catch
    }
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'zh' : 'en';
    setLang(next);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const item = UI_STRINGS[key as keyof typeof UI_STRINGS];
    if (!item) return key;
    let text = item[lang] || item.en || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        isZh: lang === 'zh',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
