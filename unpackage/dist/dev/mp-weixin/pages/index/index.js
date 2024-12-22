"use strict";
const common_vendor = require("../../common/vendor.js");
const config_promptConfig = require("../../config/promptConfig.js");
const common_assets = require("../../common/assets.js");
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
const tutorialData = {
  contacts
};
const _sfc_main = {
  name: "MessageApp",
  data() {
    return {
      // 用户输入内容
      userInput: "",
      showSendButton: false,
      // 控制发送按钮的显示
      // 大模型API相关
      model: "glm-4-flash",
      // 模型名称（固定值）
      messages: [],
      // 联系人数据
      contacts: [],
      // 表示是否已经选中过一个会话，用于改变聊天窗底色
      sessionSelected: false,
      // 当前联系人对象，用于显示聊天窗顶部的昵称、描述
      currentPerson: null,
      // 当前消息会话对象，用于聊天窗消息遍历
      currentSession: null,
      // 表示会话是否切换完成，用于会话切换渐变动画
      sessionChanged: false,
      // 表示当前会话最后一条信息，用于option类型的消息绘制
      currentMessage: null,
      // 默认只显示最近的 50 条消息
      maxVisibleMessages: 50,
      // 表示选项是否被选中（确认）
      isSelectClose: false,
      // 滚轮滑动相关
      autoScroll: true,
      // 表示是否自动下滚
      lastScrollTop: 0,
      // 表示上一次的滚动距离
      // 是否展开sidebar
      isSidebarOpen: true
    };
  },
  computed: {
    isSelectMessage() {
      return this.currentMessage && this.currentMessage.type === "select";
    },
    visibleMessages() {
      return this.currentSession && this.currentSession.messages ? this.currentSession.messages.slice(-this.maxVisibleMessages) : [];
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    // AI回复函数
    async fetchAIResponse(conversation) {
      try {
        return new Promise((resolve, reject) => {
          common_vendor.wx$1.request({
            url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            method: "POST",
            header: {
              "Content-Type": "application/json",
              "Authorization": "76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ"
              // 请替换为你的实际 API 密钥
            },
            data: {
              model: this.model,
              messages: [
                {
                  role: "system",
                  content: config_promptConfig.systemPrompt.trim()
                },
                ...conversation.map((msg) => ({
                  role: msg.role,
                  content: msg.content
                }))
              ],
              stream: false
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
                resolve(res.data.choices[0].message.content);
              } else {
                reject(new Error(`API请求失败，状态码：${res.statusCode}`));
              }
            },
            fail: (error) => {
              reject(new Error(`请求失败: ${error}`));
            }
          });
        });
      } catch (error) {
        console.error("AI回复错误:", error);
        return "抱歉，无法获取AI的回复。";
      }
    },
    // 【新增】从本地 JSON 加载聊天记录（代替 loadXML）
    loadJSON(json) {
      this.contacts = [];
      if (!json || !json.contacts) {
        console.warn("JSON 数据为空或格式不正确");
        return;
      }
      for (let person of json.contacts) {
        const newPerson = {
          name: person.name,
          icon: person.icon,
          desc: person.desc,
          sessions: [],
          select: false,
          hover: false
        };
        for (let session of person.sessions || []) {
          newPerson.sessions.push({
            id: session.id || "unnamed_session",
            name: session.name || "未命名会话",
            messages: session.messages || [],
            select: false,
            hover: false
          });
        }
        this.contacts.push(newPerson);
      }
      if (this.contacts.length > 0) {
        this.currentPerson = this.contacts[0];
        this.contacts[0].select = true;
        if (this.contacts[0].sessions.length > 0) {
          this.currentSession = this.contacts[0].sessions[0];
          this.currentSession.select = true;
          this.sessionSelected = true;
          this.sessionChanged = true;
          this.sendMessageById(this.currentSession, this.currentSession.messages[0].id);
        }
      }
    },
    // 根据消息ID发送消息
    async sendMessageById(session, messageId) {
      const msg = session.messages.find((m) => m.id === messageId);
      if (!msg) {
        console.warn(`消息ID ${messageId} 未找到`);
        return;
      }
      if (msg.type === "left" || msg.type === "right") {
        const newMessage = common_vendor.reactive({
          type: msg.type,
          name: msg.name,
          icon: msg.icon,
          msgType: msg.msgType,
          msg: msg.msg,
          src: msg.src || null,
          appear: true,
          finish: true,
          isLoading: false
        });
        this.addMessageToSession(session, newMessage);
        this.scrollToBottom();
        if (msg.next) {
          setTimeout(() => {
            this.sendMessageById(session, msg.next);
          }, parseFloat(msg.time || "1") * 1e3 + 500);
        }
      } else if (msg.type === "select") {
        const selectMessage = common_vendor.reactive({
          type: "select",
          msgType: msg.msgType,
          options: msg.options.map((option) => ({
            msg: option.msg,
            next: option.next
          }))
        });
        this.addMessageToSession(session, selectMessage);
        this.currentMessage = selectMessage;
        this.isSelectClose = false;
        this.scrollToBottom();
      }
    },
    addMessageToSession(session, newMessage) {
      session.messages.push(newMessage);
      const MAX_MESSAGES = 100;
      if (session.messages.length > MAX_MESSAGES) {
        session.messages.splice(0, session.messages.length - MAX_MESSAGES);
      }
    },
    async clickOption(option) {
      if (this.isSelectClose) {
        return;
      }
      this.isSelectClose = true;
      const newMessage = common_vendor.reactive({
        type: "right",
        name: "开拓者",
        msgType: "text",
        msg: option.msg,
        icon: "/static/images/穹.png",
        appear: true,
        finish: true
      });
      this.addMessageToSession(this.currentSession, newMessage);
      this.scrollToBottom();
      if (option.next) {
        setTimeout(() => {
          this.sendMessageById(this.currentSession, option.next);
        }, 250);
      }
    },
    selectPerson(person) {
      if (!person.select) {
        for (let p of this.contacts) {
          p.select = false;
        }
        person.select = true;
      } else {
        person.select = false;
      }
    },
    selectSession(person, session) {
      if (session === this.currentSession) {
        return;
      }
      for (let p of this.contacts) {
        for (let s of p.sessions) {
          s.select = false;
        }
      }
      session.select = true;
      this.sessionSelected = true;
      this.sessionChanged = false;
      setTimeout(() => {
        this.sessionChanged = true;
      }, 100);
      this.currentPerson = person;
      this.currentSession = session;
      this.currentSession.messages = [];
      if (this.currentSession.messages.length > 0) {
        this.sendMessageById(this.currentSession, this.currentSession.messages[0].id);
      } else {
        console.warn("当前会话没有消息");
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatBoxMiddle) {
          this.$refs.chatBoxMiddle.scrollTo({
            top: this.$refs.chatBoxMiddle.scrollHeight,
            behavior: "smooth"
          });
        }
      });
    },
    onChatBoxMiddleScroll() {
      const cm = this.$refs.chatBoxMiddle;
      if (!cm)
        return;
      const st = cm.scrollTop;
      if (st < this.lastScrollTop) {
        this.autoScroll = false;
      }
      this.lastScrollTop = st;
    },
    generateChatContext() {
      if (!this.currentSession || !this.currentSession.messages)
        return [];
      return this.currentSession.messages.map((msg) => {
        if (msg.type === "left") {
          return { role: "assistant", content: msg.msg, name: msg.name };
        } else if (msg.type === "right") {
          return { role: "user", content: msg.msg, name: msg.name };
        } else {
          return null;
        }
      }).filter((msg) => msg !== null);
    },
    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== "";
    },
    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput)
        return;
      const userMsg = common_vendor.reactive({
        type: "right",
        name: "开拓者",
        msgType: "text",
        msg: trimmedInput,
        icon: "/static/images/穹.png",
        appear: true,
        finish: true
      });
      this.addMessageToSession(this.currentSession, userMsg);
      this.scrollToBottom();
      const aiMsg = common_vendor.reactive({
        type: "left",
        name: "三月七",
        msgType: "text",
        msg: "",
        icon: "/static/images/三月七.png",
        appear: true,
        isLoading: true,
        // 加载中状态
        finish: false
      });
      this.addMessageToSession(this.currentSession, aiMsg);
      this.scrollToBottom();
      const conversation = this.generateChatContext();
      try {
        const aiReply = await this.fetchAIResponse(conversation);
        aiMsg.isLoading = false;
        aiMsg.finish = true;
        aiMsg.msg = aiReply;
        this.scrollToBottom();
      } catch (error) {
        aiMsg.isLoading = false;
        aiMsg.finish = true;
        aiMsg.msg = "抱歉，无法获取AI的回复。";
        this.scrollToBottom();
      }
      this.userInput = "";
      this.showSendButton = false;
    }
  },
  mounted() {
    try {
      this.loadJSON(tutorialData);
    } catch (error) {
      console.error("Error loading JSON:", error);
      this.contacts = [
        {
          name: "测试联系人",
          icon: "/static/images/icon.png",
          desc: "这是一个测试联系人描述",
          select: true,
          hover: false,
          sessions: [
            {
              id: "test_session",
              name: "测试会话",
              messages: [
                {
                  id: "test_msg1",
                  type: "left",
                  name: "测试NPC",
                  icon: "/static/images/icon.png",
                  msgType: "text",
                  msg: "你好，我是测试NPC，有什么需要帮助的吗？",
                  next: null
                }
              ],
              select: true,
              hover: false
            }
          ]
        }
      ];
      this.sessionSelected = true;
      this.currentPerson = this.contacts[0];
      this.currentSession = this.contacts[0].sessions[0];
      this.sessionChanged = true;
    }
    setInterval(() => {
      const cm = this.$refs.chatBoxMiddle;
      if (!cm) {
        return;
      }
      if (Math.abs(cm.scrollHeight - cm.scrollTop - cm.clientHeight) < 1) {
        this.autoScroll = true;
      }
      if (this.autoScroll) {
        this.scrollToBottom();
      }
    }, 100);
  }
};
if (!Array) {
  const _component_transition = common_vendor.resolveComponent("transition");
  _component_transition();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_assets._imports_0,
    b: $data.isSidebarOpen
  }, $data.isSidebarOpen ? {} : {}, {
    c: common_vendor.o((...args) => $options.toggleSidebar && $options.toggleSidebar(...args)),
    d: $data.isSidebarOpen
  }, $data.isSidebarOpen ? {
    e: common_vendor.f($data.contacts, (p, index, i0) => {
      return {
        a: p.icon,
        b: common_vendor.t(p.name),
        c: common_vendor.o(($event) => p.hover = true, p.name + index),
        d: common_vendor.o(($event) => p.hover = false, p.name + index),
        e: p.select && !p.hover ? 1 : "",
        f: p.hover ? 1 : "",
        g: common_vendor.o(($event) => $options.selectPerson(p), p.name + index),
        h: common_vendor.f(p.sessions, (s, sIndex, i1) => {
          return {
            a: !s.finish ? "/static/images/session-icon.png" : "/static/images/session-finish.png",
            b: common_vendor.t(s.name),
            c: common_vendor.o(($event) => s.hover = true, s.name + sIndex),
            d: common_vendor.o(($event) => s.hover = false, s.name + sIndex),
            e: s.hover ? 1 : "",
            f: s.select ? 1 : "",
            g: common_vendor.o(($event) => $options.selectSession(p, s), s.name + sIndex),
            h: "1cf27b2a-0-" + i0 + "-" + i1,
            i: s.name + sIndex
          };
        }),
        i: p.select,
        j: p.name + index
      };
    }),
    f: common_vendor.p({
      name: "fade"
    })
  } : {}, {
    g: $data.isSidebarOpen ? 1 : "",
    h: !$data.isSidebarOpen ? 1 : "",
    i: $data.sessionChanged
  }, $data.sessionChanged ? common_vendor.e({
    j: common_vendor.t((_a = $data.currentPerson) == null ? void 0 : _a.name),
    k: common_vendor.t((_b = $data.currentPerson) == null ? void 0 : _b.desc),
    l: common_vendor.p({
      name: "slide-fade",
      appear: true
    }),
    m: common_vendor.f($options.visibleMessages, (m, mIndex, i0) => {
      return common_vendor.e({
        a: m.type === "left"
      }, m.type === "left" ? common_vendor.e({
        b: m.appear
      }, m.appear ? {
        c: m.icon
      } : {}, {
        d: "1cf27b2a-3-" + i0 + ",1cf27b2a-1",
        e: common_vendor.p({
          name: "msg-icon-fade"
        }),
        f: m.appear
      }, m.appear ? {
        g: common_vendor.t(m.name)
      } : {}, {
        h: "1cf27b2a-4-" + i0 + ",1cf27b2a-1",
        i: common_vendor.p({
          name: "msg-name-fade"
        }),
        j: m.appear
      }, m.appear ? common_vendor.e({
        k: m.isLoading
      }, m.isLoading ? {} : common_vendor.e({
        l: m.msgType === "text"
      }, m.msgType === "text" ? {
        m: common_vendor.t(m.msg)
      } : {
        n: m.src
      })) : {}, {
        o: "1cf27b2a-5-" + i0 + ",1cf27b2a-1",
        p: common_vendor.p({
          name: "msg-icon-fade"
        })
      }) : {}, {
        q: m.type === "right"
      }, m.type === "right" ? common_vendor.e({
        r: m.finish
      }, m.finish ? common_vendor.e({
        s: common_vendor.t(m.name),
        t: m.msgType === "text"
      }, m.msgType === "text" ? {
        v: common_vendor.t(m.msg)
      } : {
        w: m.src
      }) : {}, {
        x: "1cf27b2a-6-" + i0 + ",1cf27b2a-1",
        y: common_vendor.p({
          name: "msg-name-fade"
        }),
        z: m.appear
      }, m.appear ? {
        A: m.icon
      } : {}, {
        B: "1cf27b2a-7-" + i0 + ",1cf27b2a-1",
        C: common_vendor.p({
          name: "msg-icon-fade"
        })
      }) : {}, {
        D: mIndex
      });
    }),
    n: $data.currentSession && $data.currentSession.finish
  }, $data.currentSession && $data.currentSession.finish ? {} : {}, {
    o: common_vendor.o((...args) => $options.onChatBoxMiddleScroll && $options.onChatBoxMiddleScroll(...args)),
    p: $options.isSelectMessage
  }, $options.isSelectMessage ? {
    q: common_vendor.f($data.currentMessage.options, (option, oIndex, i0) => {
      return {
        a: common_vendor.t(option.msg),
        b: oIndex,
        c: common_vendor.o(($event) => $options.clickOption(option), oIndex),
        d: common_vendor.o(($event) => option.hover = true, oIndex),
        e: common_vendor.o(($event) => option.hover = false, oIndex),
        f: option.hover ? 1 : "",
        g: option.click ? 1 : ""
      };
    })
  } : {}, {
    r: $options.isSelectMessage && !$data.isSelectClose ? 1 : "",
    s: $data.sessionSelected
  }, $data.sessionSelected ? common_vendor.e({
    t: common_vendor.o([($event) => $data.userInput = $event.detail.value, (...args) => $options.toggleSendButton && $options.toggleSendButton(...args)]),
    v: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    w: $data.userInput,
    x: $data.showSendButton
  }, $data.showSendButton ? {
    y: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args))
  } : {}) : {}) : {}, {
    z: common_vendor.p({
      name: "fade"
    }),
    A: $data.sessionSelected ? 1 : "",
    B: $data.isSidebarOpen ? 1 : "",
    C: !$data.isSidebarOpen ? 1 : "",
    D: $data.isSidebarOpen ? 1 : "",
    E: !$data.isSidebarOpen ? 1 : ""
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
