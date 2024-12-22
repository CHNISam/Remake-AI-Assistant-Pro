"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const contacts = [
  {
    name: "三月七",
    desc: "今天也是三月七~",
    icon: "/static/images/三月七-小.png",
    sessions: [
      {
        id: "session1",
        name: "与三月七的对话",
        messages: [
          {
            id: "msg1",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "你好呀",
            next: "msg2"
          },
          {
            id: "msg2",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "pic",
            src: "/static/images/三月七-骄傲.gif",
            msg: "[骄傲]",
            next: "msg3"
          },
          {
            id: "msg3",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "欢迎来到星铁聊天记录生成器（测试版）",
            next: "msg4"
          },
          {
            id: "msg4",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "这个网页可以制作星穹铁道风格的聊天记录",
            next: "msg5"
          },
          {
            id: "msg5",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "就像你现在看见的一样",
            next: "msg6"
          },
          {
            id: "msg6",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "并且可以像游戏里那样交互哦",
            next: "msg7"
          },
          {
            id: "msg7",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "想要学习制作一个短信会话吗？",
            next: "msg8"
          },
          {
            id: "msg8",
            type: "select",
            msgType: "text",
            options: [
              {
                msg: "想",
                next: "msg9"
              },
              {
                msg: "不想",
                next: "msg14"
              }
            ]
          },
          {
            id: "msg9",
            type: "right",
            name: "穹",
            icon: "/static/images/穹.png",
            msgType: "text",
            msg: "想啊，很想啊",
            next: "msg10"
          },
          {
            id: "msg10",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "好嘞",
            next: "msg11"
          },
          {
            id: "msg11",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "https://github.com/cubeww/star-rail-msg-maker/blob/master/README.md",
            next: "msg12"
          },
          {
            id: "msg12",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "来看吧",
            next: null
          },
          {
            id: "msg14",
            type: "right",
            name: "穹",
            icon: "/static/images/穹.png",
            msgType: "text",
            msg: "说的好，但是我不想",
            next: "msg15"
          },
          {
            id: "msg15",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七-哭.gif",
            msgType: "text",
            msg: "[哭]",
            next: "msg16"
          },
          {
            id: "msg16",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "没关系",
            next: "msg17"
          },
          {
            id: "msg17",
            type: "left",
            time: "1.0",
            name: "三月七",
            icon: "/static/images/三月七.png",
            msgType: "text",
            msg: "等你想的时候可以随时来问我~",
            next: null
          }
        ]
      }
    ]
  },
  {
    name: "丹恒",
    desc: "理性的守护者",
    icon: "/static/images/丹恒.png",
    sessions: [
      {
        id: "session2",
        name: "与丹恒的对话",
        messages: [
          {
            id: "msg1",
            type: "left",
            time: "1.0",
            name: "丹恒",
            icon: "/static/images/丹恒.png",
            msgType: "text",
            msg: "你好，我是丹恒。",
            next: "msg2"
          },
          {
            id: "msg2",
            type: "left",
            time: "1.0",
            name: "丹恒",
            icon: "/static/images/丹恒.png",
            msgType: "pic",
            src: "/static/images/饮门.png",
            msg: "[认真]",
            next: "msg3"
          },
          {
            id: "msg3",
            type: "left",
            time: "1.0",
            name: "丹恒",
            icon: "/static/images/丹恒.png",
            msgType: "text",
            msg: "欢迎来到星穹铁道。",
            next: "msg4"
          },
          {
            id: "msg4",
            type: "select",
            msgType: "text",
            options: [
              {
                msg: "请介绍你自己",
                next: "msg5"
              },
              {
                msg: "星穹列车是做什么的？",
                next: "msg9"
              }
            ]
          },
          {
            id: "msg5",
            type: "right",
            name: "开拓者",
            icon: "/static/images/星.png",
            msgType: "text",
            msg: "能介绍下你吗？",
            next: "msg6"
          },
          {
            id: "msg6",
            type: "left",
            time: "1.0",
            name: "丹恒",
            icon: "/static/images/丹恒.png",
            msgType: "text",
            msg: "我是星穹列车的守护者之一。",
            next: null
          },
          {
            id: "msg9",
            type: "right",
            name: "穹",
            icon: "/static/images/穹.png",
            msgType: "text",
            msg: "星穹列车是做什么的？",
            next: "msg10"
          },
          {
            id: "msg10",
            type: "left",
            time: "1.0",
            name: "丹恒",
            icon: "/static/images/丹恒.png",
            msgType: "text",
            msg: "这是穿越宇宙的列车，探索未知。",
            next: null
          }
        ]
      }
    ]
  }
];
const tutorial = {
  contacts
};
exports.contacts = contacts;
exports.default = tutorial;
