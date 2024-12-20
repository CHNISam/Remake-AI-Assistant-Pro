// src/api/chatService.js

const API_KEY = '76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * 发送消息到 AI
 * @param {Array} messages - 消息数组，包含角色和内容
 * @returns {Promise<string>} - 返回 AI 的回复内容
 */
export const sendMessageToAI = async (messages) => {
  try {
    const response = await uni.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      data: {
        model: "glm-4-flash",
        messages: messages,
        stream: false,
      },
    });

    const [error, res] = response;
    if (error) {
      throw new Error(`网络错误：${error.message}`);
    }

    if (res.statusCode === 200 && res.data.choices) {
      return res.data.choices[0].message.content;
    } else {
      throw new Error(`API请求失败，状态码：${res.statusCode}`);
    }
  } catch (err) {
    console.error('sendMessageToAI 错误：', err);
    throw err;
  }
};
