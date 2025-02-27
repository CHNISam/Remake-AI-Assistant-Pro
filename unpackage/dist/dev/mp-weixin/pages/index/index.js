"use strict";
const common_vendor = require("../../common/vendor.js");
const config_promptConfig = require("../../config/promptConfig.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "MessageApp",
  data() {
    return {
      userInput: "",
      // 用户输入内容
      showSendButton: false,
      // 控制发送按钮的显示
      // 大模型API相关
      model: "glm-zero-preview",
      // 模型名称
      apiToken: "76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ",
      // 请使用你自己的Token
      // 联系人数据
      contacts: [],
      sessionSelected: false,
      currentPerson: null,
      currentSession: null,
      sessionChanged: false,
      currentMessage: null,
      // 指向会话最后一条 select 消息
      maxVisibleMessages: 50,
      isSelectClose: false,
      // 用于点击选项后把选项折叠
      autoScroll: true,
      lastScrollTop: 0,
      isSidebarOpen: true,
      errorMessage: ""
      // 错误信息
    };
  },
  computed: {
    // 是否是一个 select 消息
    isSelectMessage() {
      return this.currentMessage && this.currentMessage.type === "select";
    },
    // 只显示最近 maxVisibleMessages 条
    visibleMessages() {
      return this.currentSession && this.currentSession.messages ? this.currentSession.messages.slice(-this.maxVisibleMessages) : [];
    }
  },
  methods: {
    // ------------------- 初始化联系人 -------------------
    setupContactsFromConfig() {
      const allCharacters = Object.values(config_promptConfig.characterPrompts);
      this.contacts = allCharacters.map((char) => {
        return {
          name: char.name,
          icon: char.defaultIcon,
          desc: char.desc || "角色简介",
          select: false,
          hover: false,
          sessions: [
            {
              name: `与${char.name}的会话`,
              messages: [],
              select: false,
              hover: false,
              finish: false
            }
          ]
        };
      });
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
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
    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== "";
    },
    // 切换联系人
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
    // 切换会话
    selectSession(person, session) {
      if (session === this.currentSession)
        return;
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
      if (!session.messages || session.messages.length === 0) {
        this.initSessionWithWelcome();
      }
      this.updateCurrentMessage(session);
      this.scrollToBottom();
    },
    // 初始化对话（从 promptConfig 里读取 welcomeMessages）
    initSessionWithWelcome() {
      if (!this.currentPerson || !this.currentSession)
        return;
      const config = config_promptConfig.characterPrompts[this.currentPerson.name];
      const msgs = config && config.welcomeMessages ? [...config.welcomeMessages] : [];
      if (!msgs.length)
        return;
      this.currentSession.messages = [];
      this.currentSession._queue = msgs;
      this.currentSession._index = 0;
      this.currentSession._nextIndex = null;
      this.currentSession.isQueueActive = true;
      this.currentSession.insertNext = () => {
        if (this.currentSession._index >= this.currentSession._queue.length) {
          this.currentSession.isQueueActive = false;
          return;
        }
        const raw = this.currentSession._queue[this.currentSession._index];
        const newMsg = common_vendor.reactive({
          ...raw,
          appear: false,
          finish: false,
          isLoading: true
        });
        this.addMessageToSession(this.currentSession, newMsg);
        const isRight = raw.type === "right";
        const appearDelay = isRight ? 100 : 500;
        const finishDelay = isRight ? 250 : 1e3;
        setTimeout(() => {
          newMsg.appear = true;
          setTimeout(() => {
            newMsg.finish = true;
            newMsg.isLoading = false;
            if (raw.type === "select") {
              this.currentSession._nextIndex = this.currentSession._index + 1;
            } else {
              this.currentSession._index++;
              this.currentSession.insertNext();
            }
          }, finishDelay);
        }, appearDelay);
      };
      this.currentSession.insertNext();
    },
    addMessageToSession(session, newMessage) {
      session.messages.push(newMessage);
      const MAX_MESSAGES = 100;
      if (session.messages.length > MAX_MESSAGES) {
        session.messages.splice(0, session.messages.length - MAX_MESSAGES);
      }
      this.updateCurrentMessage(session);
    },
    updateCurrentMessage(session) {
      if (!session || !session.messages || session.messages.length === 0) {
        this.currentMessage = null;
        return;
      }
      const last = session.messages[session.messages.length - 1];
      if (last.type === "select") {
        this.currentMessage = last;
        this.isSelectClose = false;
      } else {
        this.currentMessage = null;
      }
    },
    // 点击选项
    async clickOption(option) {
      if (this.isSelectClose)
        return;
      option.click = true;
      this.isSelectClose = true;
      if (option.children && Array.isArray(option.children)) {
        let i = 0;
        const insertChild = () => {
          if (i >= option.children.length) {
            this.continueQueue();
            return;
          }
          const raw = option.children[i];
          const newMsg = common_vendor.reactive({
            ...raw,
            appear: false,
            finish: false,
            isLoading: true
          });
          this.addMessageToSession(this.currentSession, newMsg);
          setTimeout(() => {
            newMsg.appear = true;
            setTimeout(() => {
              newMsg.finish = true;
              newMsg.isLoading = false;
              i++;
              insertChild();
            }, 1e3);
          }, 500);
        };
        insertChild();
      } else {
        this.userInput = option.msg;
        await this.sendMessage();
      }
    },
    continueQueue() {
      if (this.currentSession && this.currentSession._nextIndex != null && this.currentSession._index !== this.currentSession._nextIndex) {
        this.currentSession._index = this.currentSession._nextIndex;
      }
      if (this.currentSession && this.currentSession.insertNext) {
        this.currentSession.insertNext();
      }
    },
    // ------------------- 发送消息 -------------------
    async sendMessage() {
      var _a;
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput)
        return;
      const userMsg = common_vendor.reactive({
        type: "right",
        name: "开拓者",
        msgType: "text",
        msg: trimmedInput,
        icon: "/static/images/穹.png",
        appear: false,
        finish: false,
        isLoading: true
      });
      this.addMessageToSession(this.currentSession, userMsg);
      this.scrollToBottom();
      const appearDelay = 100;
      const finishDelay = 250;
      setTimeout(() => {
        userMsg.appear = true;
        setTimeout(() => {
          userMsg.finish = true;
          userMsg.isLoading = false;
        }, finishDelay);
      }, appearDelay);
      const aiMsg = common_vendor.reactive({
        type: "left",
        name: this.currentPerson ? this.currentPerson.name : "系统",
        msgType: "text",
        msg: "正在获取AI回复...",
        icon: ((_a = config_promptConfig.characterPrompts[this.currentPerson.name]) == null ? void 0 : _a.defaultIcon) || "/static/images/default.png",
        appear: true,
        isLoading: true,
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
        if (!this.currentSession.finish) {
          this.generateNextUserOptions();
        }
      } catch (error) {
        aiMsg.isLoading = false;
        aiMsg.finish = true;
        aiMsg.msg = "抱歉，无法获取AI的回复。";
        this.scrollToBottom();
      }
      this.userInput = "";
      this.showSendButton = false;
    },
    // ------------------- 自动生成下一步用户可选回复 -------------------
    async generateNextUserOptions() {
      if (!this.currentSession)
        return;
      try {
        const conversation = this.generateChatContext();
        const suggestions = await this.generateMultipleSuggestions(conversation);
        if (!suggestions || suggestions.length === 0)
          return;
        const selectMsg = this.buildSelectMessage(suggestions);
        this.addMessageToSession(this.currentSession, selectMsg);
        this.isSelectClose = false;
        this.scrollToBottom();
      } catch (err) {
        console.error("生成下一步用户回复失败：", err);
      }
    },
    buildSelectMessage(suggestionsArray) {
      var _a;
      return common_vendor.reactive({
        type: "select",
        name: "建议",
        icon: ((_a = config_promptConfig.characterPrompts[this.currentPerson.name]) == null ? void 0 : _a.defaultIcon) || "/static/images/default.png",
        appear: true,
        finish: true,
        isLoading: false,
        options: suggestionsArray.map((text) => ({
          msg: text,
          hover: false,
          click: false
        }))
      });
    },
    // ------------------- 大模型AI回复 -------------------
    async fetchAIResponse(conversation) {
      return new Promise((resolve, reject) => {
        common_vendor.wx$1.request({
          url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`
          },
          data: {
            model: this.model,
            messages: [
              {
                role: "system",
                content: this.currentPerson && config_promptConfig.characterPrompts[this.currentPerson.name] ? config_promptConfig.characterPrompts[this.currentPerson.name].systemPrompt : "这是一个默认的 systemPrompt，用于兜底处理。"
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
              resolve(res.data.choices[0].message.content.trim());
            } else {
              reject(new Error(`API请求失败，状态码：${res.statusCode}，返回数据：${JSON.stringify(res.data)}`));
            }
          },
          fail: (error) => {
            reject(new Error(`请求失败: ${error}`));
          }
        });
      }).catch((error) => {
        console.error("AI回复错误:", error);
        return "抱歉，无法获取AI的回复。";
      });
    },
    // ------------------- 并发生成单个建议 -------------------
    async fetchSingleSuggestion(conversation) {
      return new Promise((resolve, reject) => {
        common_vendor.wx$1.request({
          url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`
          },
          data: {
            model: this.model,
            temperature: 0,
            messages: [
              {
                role: "system",
                content: "请扮演游戏《崩坏：星穹铁道》中的开拓者，一名性格古怪、幽默风趣的冒险者。请站在我们的角度，给出一个简短建议，回复不超过25字。"
              },
              ...conversation.map((msg) => ({
                role: msg.role,
                content: msg.content
              }))
            ],
            stream: false
          },
          success: (res) => {
            console.log("Single suggestion response:", res);
            if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
              let content = res.data.choices[0].message.content.trim();
              console.log("Single suggestion raw content:", content);
              let suggestion = "";
              try {
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  suggestion = parsed[0];
                } else {
                  suggestion = content;
                }
              } catch (e) {
                const regex = /(?:建议|选项)[：:]\s*([^，。]+)/;
                const match = content.match(regex);
                if (match && match[1]) {
                  suggestion = match[1].trim();
                } else {
                  suggestion = content;
                }
              }
              if (suggestion.length > 25) {
                suggestion = suggestion.substring(0, 25);
              }
              resolve(suggestion);
            } else {
              console.error("Single suggestion API返回数据不符合预期:", res);
              reject(new Error(`生成建议API请求失败，状态码：${res.statusCode}，返回数据：${JSON.stringify(res.data)}`));
            }
          },
          fail: (error) => {
            console.error("Single suggestion API请求失败:", error);
            reject(new Error(`请求失败: ${error}`));
          }
        });
      });
    },
    // ------------------- 并发生成多个建议 -------------------
    async generateMultipleSuggestions(conversation) {
      const suggestionCount = 2;
      const promises = [];
      for (let i = 0; i < suggestionCount; i++) {
        promises.push(this.fetchSingleSuggestion(conversation));
      }
      try {
        const suggestions = await Promise.all(promises);
        return suggestions;
      } catch (e) {
        console.error("并发生成建议失败：", e);
        throw e;
      }
    },
    // ------------------- 独立的请求函数 -------------------
    makeRequest(conversation) {
      return new Promise((resolve, reject) => {
        common_vendor.wx$1.request({
          url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          method: "POST",
          header: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`
          },
          data: {
            model: this.model,
            temperature: 0,
            messages: [
              {
                role: "system",
                content: `你是一个对话助手，请根据上下文给出2~3个简短建议，输出必须是标准 JSON 数组，例如：["建议1","建议2"]。`
              },
              ...conversation.map((msg) => ({
                role: msg.role,
                content: msg.content
              }))
            ],
            stream: false
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.data);
            } else {
              reject(new Error(`API请求失败，状态码：${res.statusCode}`));
            }
          },
          fail: (error) => {
            reject(new Error(`请求失败: ${error}`));
          }
        });
      });
    },
    // 将当前会话消息转换为模型所需的上下文
    generateChatContext() {
      if (!this.currentSession || !this.currentSession.messages)
        return [];
      return this.currentSession.messages.map((msg) => {
        if (msg.type === "left") {
          return { role: "assistant", content: msg.msg };
        } else {
          return { role: "user", content: msg.msg };
        }
      });
    }
  },
  mounted() {
    this.setupContactsFromConfig();
    if (this.contacts.length > 0) {
      this.selectPerson(this.contacts[0]);
      if (this.contacts[0].sessions.length > 0) {
        this.selectSession(this.contacts[0], this.contacts[0].sessions[0]);
        this.updateCurrentMessage(this.contacts[0].sessions[0]);
      }
    }
    setInterval(() => {
      const cm = this.$refs.chatBoxMiddle;
      if (!cm)
        return;
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
