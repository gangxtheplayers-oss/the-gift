import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { promptType, partnerName, herQualities, tone, currentDraft, language } = await req.json();
    const isZh = language === 'zh';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: isZh
            ? 'GEMINI_API_KEY 尚未配置。您可以随时直接在输入框中亲笔书写和修改深情长信！'
            : 'GEMINI_API_KEY is not configured yet. You can still write and edit your letter manually anytime!',
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let instruction = '';
    let userPrompt = '';

    if (promptType === 'letter') {
      if (isZh) {
        instruction = `你是一位才华横溢、温柔深情的作家，正在帮助一位恋人给挚爱的女孩（${partnerName || '他的女孩'}）写一封发自肺腑、真挚动人的中文情书。
语调：${tone || '深情浪漫、诗意温存、纯粹真诚、绝不浮夸'}。
避免空洞套话或AI机械感，行文如涓涓细流，流露最细腻的心动与珍惜。字数控制在200到350字左右，必须全部使用优美流畅的简体中文输出。`;
        userPrompt = `请为 ${partnerName || '我的女孩'} 创作或润色一封情书。
她的特质与关于她的心动瞬间：${herQualities || '她的笑靥、温柔体贴、纯粹的心灵，以及每次靠在一起时无与伦比的安全感'}。
当前草稿参考（如有）：${currentDraft || '无'}`;
      } else {
        instruction = `You are a deeply empathetic, eloquent romantic writer helping someone write a heartfelt, authentic digital love letter for their girlfriend (${partnerName || 'his girlfriend'}). 
Tone: ${tone || 'emotional, timeless, poetic yet genuine'}.
Avoid cliches or cringe corporate phrasing. Make it sound like a real person writing from the deepest corners of their soul. Keep it between 150 to 250 words.`;
        userPrompt = `Please write or refine a love letter for ${partnerName}. 
Special traits/qualities: ${herQualities || 'her laughter, warmth, kindness, and how she makes everywhere feel like home'}.
Existing draft notes (if any): ${currentDraft || 'none'}`;
      }
    } else if (promptType === 'reasons') {
      if (isZh) {
        instruction = `为名叫 ${partnerName || '她'} 的女孩生成5条独特、触及灵魂、细腻真实的爱她的理由。
穿插游戏并肩作战与日常相处的甜蜜。
输出格式：包含5个中文字符串的 JSON 数组。必须输出中文。`;
        userPrompt = `关于她的专属细节：${herQualities || '迷人的笑眼、软软的卫衣、善良的心、深夜的促膝长谈'}。`;
      } else {
        instruction = `Generate 5 unique, deeply touching, and specific reasons to love someone named ${partnerName || 'her'}.
Mix playful everyday moments with heartfelt emotional depth.
Output format: JSON array of 5 strings.`;
        userPrompt = `Special things about her: ${herQualities || 'smiling eyes, cozy hoodies, caring heart, late night talks'}.`;
      }
    } else {
      if (isZh) {
        instruction = `为 ${partnerName || '挚爱'} 创作一首惊艳绝美、四行以内的星光深情短诗或誓言。必须全部使用优美流畅的简体中文。`;
        userPrompt = `灵感来源：${herQualities || '星河璀璨、此生不渝、相伴白头'}。`;
      } else {
        instruction = `Write a short, breathtaking 4-line romantic poem or starlit dedication for ${partnerName || 'my love'}.`;
        userPrompt = `Dedication inspired by: ${herQualities || 'starlight, endless love, growing old together'}.`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: instruction,
        temperature: 0.85,
      },
    });

    return NextResponse.json({
      success: true,
      text: response.text || '',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
