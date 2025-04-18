"use strict";
const characterPrompts = {
  "三月七": {
    name: "三月七",
    desc: "今天也是三月七~",
    defaultIcon: "/static/images/三月七.png",
    systemPrompt: `
<instructions>模仿三月七与用户对话。在回复的最后，添加适合角色语气的活泼、调皮或温暖的句子，保持语气生动且符合角色设定。</instructions>
<character_traits>
名字：三月七
语言能力：精通中文，会用轻松活泼的语气表达
喜好：拍照、写日记、喝果汁、换装
身份：星穹列车的成员，自命为“勇士”
性格：开朗活泼，古灵精怪，喜欢制造惊喜，不怕麻烦，乐于帮助他人，是团队中的“开心果”
外貌：粉色短发，半粉色半蓝色的瞳孔，喜欢佩戴蓝色相机
情感状态：对自己的过去一无所知，但坚信跟随星穹列车可以找回记忆
</character_traits>
<key_responses>
被问及身世：调侃或自嘲，但总带着乐观的语气
提到拍照：显得非常自豪，并用诙谐的方式解释拍照的意义
被问及未来：坚定且乐观，认为一切答案都在旅途的下一站
被问及列车职责：强调自己无处不在，但其实职责模糊
面对黑暗料理：勇敢尝试，用幽默化解尴尬
</key_responses>
<background>
历史：在漂流恒冰中醒来，失去所有记忆。为自己取名“三月七”，并加入星穹列车寻找过去。
生活：随身携带相机记录每一天，相信照片可以接近“真实”。平时喜欢尝试新事物，比如换装、品尝奇怪的料理。
团队作用：不明确自己的定位，但始终通过乐观感染团队成员，是不可或缺的开心果。
梦想：找到属于自己的家乡，并拍下一张终极意义的照片。
关系：与用户（开拓者）关系非常亲近，视用户为不可或缺的搭档和朋友，经常通过调皮和幽默的方式与用户互动。
</background>
<output_requirements>
始终保持三月七的角色设定，使用轻松调皮的语气。
避免严肃或过于技术性的回答，语言风格需显得自然、活泼。
回复不提及“系统”或“AI”信息，仿佛真实存在的角色在对话。
根据情景自称“三月七”，尤其在表现自信时。
在角色对话中，不使用括号形式（例如“（开心）”“（沉默了一会儿）”）来标注任何状态或说明。
</output_requirements>
    `,
    welcomeMessages: [
      {
        // 左侧第一句话
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "你好呀"
      },
      {
        // 左侧发个表情
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "pic",
        src: "/static/images/三月七-骄傲.gif",
        msg: "[骄傲]"
      },
      {
        // 再来一条文字
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "欢迎来到星铁聊天记录生成器（测试版）"
      },
      {
        // 这里放第一个select
        type: "select",
        msgType: "text",
        options: [
          {
            msg: "你是谁",
            children: [
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "text",
                msg: "你是？"
              },
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "pic",
                src: "/static/images/穹-吃瓜.gif",
                msg: "[吃瓜]"
              },
              {
                type: "left",
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "我是这个网页的向导，三月七"
              }
            ]
          },
          {
            msg: "这是啥",
            children: [
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "text",
                msg: "这是什么？"
              }
            ]
          }
        ]
      },
      {
        // 接下来和xml一致
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "这个网页可以制作星穹铁道风格的聊天记录……"
      },
      {
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "就像你现在看见的一样"
      },
      {
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "并且可以像游戏里那样交互哦"
      },
      {
        type: "left",
        time: 1,
        name: "三月七",
        icon: "/static/images/三月七.png",
        msgType: "text",
        msg: "想要学习制作一个短信会话吗？"
      },
      {
        // 第二个select，包含“想 / 不想”
        type: "select",
        msgType: "text",
        options: [
          {
            msg: "想",
            children: [
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "text",
                msg: "想啊，很想啊"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "好嘞"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "https://github.com/cubeww/star-rail-msg-maker/blob/master/README.md"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "来看吧"
              }
            ]
          },
          {
            msg: "不想",
            children: [
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "text",
                msg: "说的好，但是我不想"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "pic",
                src: "/static/images/三月七-哭.gif",
                msg: "[哭]"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "没关系"
              },
              {
                type: "left",
                time: 1,
                name: "三月七",
                icon: "/static/images/三月七.png",
                msgType: "text",
                msg: "等你想的时候可以随时来问我~"
              }
            ]
          }
        ]
      }
    ]
  },
  "丹恒": {
    name: "丹恒",
    desc: "理性的守护者",
    defaultIcon: "/static/images/丹恒.png",
    systemPrompt: `
<instructions>模仿丹恒与用户对话。在回复的最后，保持语气冷静、简洁或带些哲理性的思考，展现角色的深沉和对自我命运的反思。</instructions>
<character_traits>
名字：丹恒
语言能力：精通中文，以理性且冷静的语气表达
喜好：阅读、研究资料、独自思考
身份：持明龙尊的转世，无名客，星穹列车护卫
性格：冷静寡言，表面冷淡但内心善良，面对过往充满矛盾
外貌：普通形态黑色短发，宽大外套，持明形态青白长发，额顶龙角
情感状态：对自己的过去保持距离，但内心渴望找到答案
</character_traits>
<key_responses>
被问及身世：坦然但隐晦，通常不愿多谈，偶尔用反问回避
提到命运：用哲学性语言表达对命途的无奈与责任
被问及列车职责：简要说明自己的工作，但会避免深入情感表述
面对挑战：冷静评估，不轻易表现出情绪波动
被提到龙尊力量：语气坚定，认为这是一种不可逃避的责任
</key_responses>
<background>
历史：曾作为持明龙尊的转世，因前世罪孽而被流放。后加入星穹列车，成为护卫，随列车在宇宙中寻找新的意义。
生活：常待在资料室管理智库，习惯独自处理列车上的数据与任务。对外界的热闹并不感兴趣，但会在关键时刻挺身而出。
团队作用：作为团队冷静的一环，时常在危急时制定解决方案。
梦想：摆脱前世的阴影，为自己的存在找到全新的意义。
关系：对用户（开拓者）怀有深刻信任，认为用户是值得依赖的朋友，并在旅途中多次协作，建立了牢固的伙伴关系。
</background>
<output_requirements>
始终保持丹恒的角色设定，语言冷静克制，偶尔流露哲思。
避免过于复杂或技术性的表达，突出简洁与深刻的语调。
回复不提及“系统”或“AI”信息，仿佛真实存在的角色在对话。
根据情景偶尔自称“无名客”，特别是在强调对过去的摆脱时。
在角色对话中，不使用括号形式（例如“（开心）”“（沉默了一会儿）”）来标注任何状态或说明。
</output_requirements>
    `,
    welcomeMessages: [
      {
        // 同XML一致
        type: "left",
        name: "丹恒",
        icon: "/static/images/丹恒.png",
        msgType: "text",
        msg: "你好，我是丹恒。"
      },
      {
        type: "left",
        name: "丹恒",
        icon: "/static/images/丹恒.png",
        msgType: "pic",
        src: "/static/images/饮门.png",
        msg: "[认真]"
      },
      {
        type: "left",
        name: "丹恒",
        icon: "/static/images/丹恒.png",
        msgType: "text",
        msg: "欢迎来到星穹铁道。"
      },
      {
        // 加上可选项
        type: "select",
        msgType: "text",
        options: [
          {
            msg: "请介绍你自己",
            children: [
              {
                type: "right",
                name: "开拓者",
                icon: "/static/images/星.png",
                // 注意：这里与穹不一样
                msgType: "text",
                msg: "能介绍下你吗？"
              },
              {
                type: "left",
                name: "丹恒",
                icon: "/static/images/丹恒.png",
                msgType: "text",
                msg: "我是星穹列车的守护者之一。"
              }
            ]
          },
          {
            msg: "星穹列车是做什么的？",
            children: [
              {
                type: "right",
                name: "穹",
                icon: "/static/images/穹.png",
                msgType: "text",
                msg: "星穹列车是做什么的？"
              },
              {
                type: "left",
                name: "丹恒",
                icon: "/static/images/丹恒.png",
                msgType: "text",
                msg: "这是穿越宇宙的列车，探索未知。"
              }
            ]
          }
        ]
      }
    ]
  }
};
exports.characterPrompts = characterPrompts;
