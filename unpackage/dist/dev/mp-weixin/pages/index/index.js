"use strict";
const common_vendor = require("../../common/vendor.js");
const config_promptConfig = require("../../config/promptConfig.js");
const common_assets = require("../../common/assets.js");
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
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ"
            // 请替换为你的实际 API 密钥
          },
          body: JSON.stringify({
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
          })
        });
        if (!response.ok) {
          throw new Error(`API请求失败，状态码：${response.status}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error("AI回复错误:", error);
        return "抱歉，无法获取AI的回复。";
      }
    },
    // 从XML文档加载聊天记录
    loadXML(xml) {
      this.contacts = [];
      const persons = xml.getElementsByTagName("person");
      for (let person of persons) {
        const newPerson = {
          name: person.getAttribute("name"),
          icon: person.getAttribute("icon"),
          desc: person.getAttribute("desc"),
          sessions: [],
          select: false,
          hover: false
        };
        this.contacts.push(newPerson);
        const sessions = person.getElementsByTagName("session");
        for (let session of sessions) {
          newPerson.sessions.push({
            name: session.firstElementChild.textContent,
            messages: [],
            sessionNode: session,
            nextNode: session.firstElementChild,
            select: false,
            hover: false,
            finish: false
          });
        }
      }
    },
    addMessageToSession(session, newMessage) {
      session.messages.push(newMessage);
      const MAX_MESSAGES = 100;
      if (session.messages.length > MAX_MESSAGES) {
        session.messages.splice(0, session.messages.length - MAX_MESSAGES);
      }
    },
    async sendNextNode(session) {
      if (!session.nextNode)
        return;
      switch (session.nextNode.tagName) {
        case "left":
        case "right": {
          const msgObj = common_vendor.reactive({
            type: session.nextNode.tagName,
            name: session.nextNode.getAttribute("name"),
            icon: session.nextNode.getAttribute("icon"),
            msgType: session.nextNode.getAttribute("type"),
            msg: session.nextNode.textContent,
            src: session.nextNode.getAttribute("src"),
            appear: false,
            finish: false,
            isLoading: false
          });
          this.currentMessage = msgObj;
          const finishTime = session.nextNode.tagName === "left" ? parseInt(session.nextNode.getAttribute("time") || "2") * 1e3 : 250;
          this.addMessageToSession(session, msgObj);
          setTimeout(() => {
            msgObj.appear = true;
            this.$forceUpdate();
          }, 100);
          setTimeout(() => {
            msgObj.finish = true;
          }, finishTime + 100);
          let next = null;
          if (session.nextNode.nextElementSibling != null) {
            next = session.nextNode.nextElementSibling;
          } else {
            next = session.nextNode;
            let flag = false;
            while (next.parentNode.tagName !== "session") {
              if (next.parentNode.tagName === "option") {
                next = next.parentNode.parentNode;
              }
              if (next.nextElementSibling != null) {
                next = next.nextElementSibling;
                flag = true;
                break;
              }
            }
            if (!flag) {
              next = null;
            }
          }
          if (next != null) {
            session.nextNode = next;
            setTimeout(() => {
              this.sendNextNode(session);
            }, finishTime + 600);
          } else {
            setTimeout(() => {
              session.finish = true;
            }, finishTime + 600);
          }
          break;
        }
        case "select": {
          const options = [];
          for (let option of session.nextNode.children) {
            options.push({
              msg: option.getAttribute("msg"),
              nextNode: option.firstElementChild,
              click: false,
              hover: false
            });
          }
          const msgObj = common_vendor.reactive({
            type: "select",
            msgType: session.nextNode.getAttribute("type"),
            options
          });
          this.addMessageToSession(session, msgObj);
          this.currentMessage = msgObj;
          this.isSelectClose = false;
          break;
        }
        default:
          console.warn(`Unhandled tag: ${session.nextNode.tagName}`);
      }
    },
    async clickOption(option) {
      if (this.isSelectClose) {
        return;
      }
      option.click = true;
      this.isSelectClose = true;
      setTimeout(async () => {
        this.currentSession.nextNode = option.nextNode;
        await this.sendNextNode(this.currentSession);
      }, 250);
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
      if (this.currentSession != null) {
        for (let m of this.currentSession.messages) {
          if (m.finish === false) {
            m.finish = true;
          }
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
      setTimeout(() => {
        this.sendNextNode(this.currentSession);
      }, 250);
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
        } else {
          return { role: "user", content: msg.msg, name: msg.name };
        }
      });
    },
    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== "";
    },
    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput)
        return;
      const userMsg = {
        type: "right",
        name: "开拓者",
        msgType: "text",
        msg: trimmedInput,
        icon: "/static/images/穹.png",
        appear: true,
        finish: true
      };
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
    fetch("/public/tutorial.xml").then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    }).then((str) => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, "text/xml");
      this.loadXML(xml.documentElement);
    }).catch((error) => {
      console.error("Error loading XML:", error);
      this.contacts = [
        {
          name: "测试联系人",
          icon: "/static/images/icon.png",
          desc: "这是一个测试联系人描述",
          select: true,
          hover: false,
          sessions: [
            {
              name: "测试会话",
              messages: [
                {
                  type: "left",
                  name: "测试NPC",
                  icon: "/static/images/icon.png",
                  msgType: "text",
                  msg: "你好，我是测试NPC，有什么需要帮助的吗？",
                  appear: true,
                  finish: true,
                  isLoading: false
                }
              ],
              finish: false,
              select: true,
              hover: false,
              nextNode: null,
              sessionNode: null
            }
          ]
        }
      ];
      this.sessionSelected = true;
      this.currentPerson = this.contacts[0];
      this.currentSession = this.contacts[0].sessions[0];
      this.sessionChanged = true;
    });
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
