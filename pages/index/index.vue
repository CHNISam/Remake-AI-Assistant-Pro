<template>
  <div>
    <div class="form">
      <!-- 顶部条作为一个icon，点击可切换sidebar -->
      <div class="title-bar" @click="toggleSidebar">
        <img src="/static/images/icon.png" alt="icon" class="title-icon" />
        <!-- 当 isSidebarOpen 为 true 时显示标题 -->
        <span class="title" v-if="isSidebarOpen">短信</span>
      </div>

      <div class="content" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
        <div class="left" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
          <!-- 联系人列表 -->
          <div class="contacts-list" v-if="isSidebarOpen">
            <div v-for="(p, index) in contacts" :key="p.name + index">
              <!-- 联系人盒子本体 -->
              <div
                class="person"
                @mouseover="p.hover = true"
                @mouseleave="p.hover = false"
                :class="{
                  'person-select': p.select && !p.hover,
                  'person-hover': p.hover
                }"
                @click="selectPerson(p)"
              >
                <!-- 头像 -->
                <img :src="p.icon" alt="" class="person-icon" /> &nbsp;&nbsp;
                <!-- 名称 -->
                <span>{{ p.name }}</span>
              </div>
              <!-- 联系人选中时，下面出现的会话列表 -->
              <div v-for="(s, sIndex) in p.sessions" :key="s.name + sIndex">
                <transition name="fade">
                  <div
                    v-show="p.select"
                    class="session"
                    @mouseover="s.hover = true"
                    @mouseleave="s.hover = false"
                    :class="{
                      'session-hover': s.hover,
                      'session-select': s.select
                    }"
                    @click="selectSession(p, s)"
                  >
                    <!-- 会话状态图标 -->
                    <img
                      class="session-icon"
                      :src="!s.finish
                        ? '/static/images/session-icon.png'
                        : '/static/images/session-finish.png'"
                      alt=""
                    />
                    <!-- 会话名称 -->
                    <span>{{ s.name }}</span>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <!-- 聊天框 -->
        <div class="right" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }">
          <div class="chat-box" :class="{ 'chat-box-active': sessionSelected }">
            <transition name="fade">
              <div class="chat-box-container" v-if="sessionChanged">
                <!-- 聊天框-顶部盒子（名称和描述信息） -->
                <transition name="slide-fade" appear>
                  <div class="chat-box-top">
                    <div class="chat-box-top-name">{{ currentPerson?.name }}</div>
                    <div class="chat-box-top-desc">{{ currentPerson?.desc }}</div>
                  </div>
                </transition>
                <hr class="chat-box-top-hr" />
                <!-- 聊天框-内容盒子 -->
                <div
                  class="chat-box-middle"
                  ref="chatBoxMiddle"
                  @scroll="onChatBoxMiddleScroll"
                >
                  <!-- 聊天内容 -->
                  <template v-for="(m, mIndex) in visibleMessages" :key="mIndex">
                    <!-- 对方的消息 -->
                    <div v-if="m.type === 'left'" class="msg-left">
                      <!-- 聊天内容-头像 -->
                      <transition name="msg-icon-fade">
                        <img
                          v-if="m.appear"
                          :src="m.icon"
                          alt=""
                          class="msg-left-icon"
                        />
                      </transition>
                      <div class="msg-left-name-and-content">
                        <!-- 聊天内容-昵称 -->
                        <transition name="msg-name-fade">
                          <div v-if="m.appear" class="msg-left-name">
                            {{ m.name }}
                          </div>
                        </transition>
                        <!-- 聊天内容-消息 -->
                        <transition name="msg-icon-fade">
                          <div v-if="m.appear">
                            <!-- 显示加载动画或实际消息内容 -->
                            <div v-if="m.isLoading" class="msg-left-circle-box">
                              <div class="msg-circle-1"></div>
                              <div class="msg-circle-2"></div>
                              <div class="msg-circle-3"></div>
                            </div>
                            <div v-else>
                              <div v-if="m.msgType === 'text'" class="msg-left-balloon">
                                <div class="msg-left-content">{{ m.msg }}</div>
                              </div>
                              <div v-else>
                                <img
                                  class="msg-pic-content"
                                  :src="m.src"
                                  alt=""
                                />
                              </div>
                            </div>
                          </div>
                        </transition>
                      </div>
                    </div>

                    <!-- 自己的消息 -->
                    <div v-if="m.type === 'right'" class="msg-right">
                      <transition name="msg-name-fade">
                        <div v-if="m.finish" class="msg-right-other">
                          <!-- 聊天内容-昵称 -->
                          <div class="msg-right-name">{{ m.name }}</div>
                          <!-- 聊天内容-消息 -->
                          <div
                            v-if="m.msgType === 'text'"
                            class="msg-right-content"
                          >
                            {{ m.msg }}
                          </div>
                          <img
                            v-else
                            class="msg-pic-content"
                            :src="m.src"
                            alt=""
                          />
                        </div>
                      </transition>

                      <!-- 聊天内容-头像 -->
                      <transition name="msg-icon-fade">
                        <img
                          v-if="m.appear"
                          :src="m.icon"
                          alt=""
                          class="msg-right-icon"
                        />
                      </transition>
                    </div>
                  </template>
                  <!-- TODO: 优化底部水平线显示条件 -->
                  <hr v-if="currentSession && currentSession.finish" class="chat-box-middle-hr" />
                </div>
                <!-- 聊天框-底部盒子（回复选项） -->
                <div class="chat-box-bottom-grow"></div>
                <div
                  class="chat-box-bottom"
                  :class="{
                    'chat-box-bottom-expand': isSelectMessage && !isSelectClose
                  }"
                >
                  <div v-if="isSelectMessage">
                    <hr class="chat-box-bottom-hr" />
                    <div
                      v-for="(option, oIndex) in currentMessage.options"
                      :key="oIndex"
                      class="option"
                      @click="clickOption(option)"
                      @mouseover="option.hover = true"
                      @mouseleave="option.hover = false"
                      :class="{
                        'option-hover': option.hover,
                        'option-click': option.click
                      }"
                    >
                      {{ option.msg }}
                    </div>
                  </div>
                </div>
                <!-- 用户输入框和发送按钮 -->
                <div class="input-area" v-if="sessionSelected">
                  <input
                    v-model="userInput"
                    placeholder="输入消息..."
                    class="input-box"
                    @input="toggleSendButton"
                    @keydown.enter="sendMessage"
                  />
                  <div
                    v-if="showSendButton"
                    class="send-icon"
                    @click="sendMessage"
                  >
                    ➤
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <!-- 页尾声明 -->
      <div class="foot">
        <div>
          Star Rail Message Maker v0.5
          <a href="https://github.com/cubeww/star-rail-msg-maker">Github</a>
        </div>
        <div>B站：@冰块Cube</div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { systemPrompt } from '/config/promptConfig.js'; // 导入系统提示
// 直接导入本地 JSON
import tutorialData from '/public/tutorial.json'; 

export default {
  name: 'MessageApp',
  data() {
    return {
      // 用户输入内容
      userInput: '',
      showSendButton: false, // 控制发送按钮的显示
      // 大模型API相关
      model: 'glm-4-flash', // 模型名称（固定值）
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
      autoScroll: true, // 表示是否自动下滚
      lastScrollTop: 0, // 表示上一次的滚动距离

      // 是否展开sidebar
      isSidebarOpen: true,
    };
  },
  computed: {
    isSelectMessage() {
      return this.currentMessage && this.currentMessage.type === 'select';
    },
    visibleMessages() {
      return this.currentSession && this.currentSession.messages
        ? this.currentSession.messages.slice(-this.maxVisibleMessages)
        : [];
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },

    // AI回复函数
    async fetchAIResponse(conversation) {
      try {
        return new Promise((resolve, reject) => {
          wx.request({
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': '76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ' // 请替换为你的实际 API 密钥
            },
            data: {
              model: this.model,
              messages: [
                {
                  role: 'system',
                  content: systemPrompt.trim(),
                },
                ...conversation.map(msg => ({
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
        console.error('AI回复错误:', error);
        return '抱歉，无法获取AI的回复。';
      }
    },

    // 【新增】从本地 JSON 加载聊天记录（代替 loadXML）
    loadJSON(json) {
      this.contacts = []; // 先清空

      if (!json || !json.contacts) {
        console.warn('JSON 数据为空或格式不正确');
        return;
      }

      // 遍历 contacts
      for (let person of json.contacts) {
        const newPerson = {
          name: person.name,
          icon: person.icon,
          desc: person.desc,
          sessions: [],
          select: false,
          hover: false,
        };

        // 遍历所有 sessions
        for (let session of person.sessions || []) {
          // 这里直接用 JSON 内的数据
          newPerson.sessions.push({
            id: session.id || 'unnamed_session',
            name: session.name || '未命名会话',
            messages: session.messages || [],
            select: false,
            hover: false,
          });
        }

        this.contacts.push(newPerson);
      }

      // 如果有联系人，默认选第一个联系人和第一个会话
      if (this.contacts.length > 0) {
        this.currentPerson = this.contacts[0];
        this.contacts[0].select = true;

        if (this.contacts[0].sessions.length > 0) {
          this.currentSession = this.contacts[0].sessions[0];
          this.currentSession.select = true;
          this.sessionSelected = true;
          this.sessionChanged = true;

          // 开始发送第一条消息
          this.sendMessageById(this.currentSession, this.currentSession.messages[0].id);
        }
      }
    },

    // 根据消息ID发送消息
    async sendMessageById(session, messageId) {
      const msg = session.messages.find(m => m.id === messageId);
      if (!msg) {
        console.warn(`消息ID ${messageId} 未找到`);
        return;
      }

      if (msg.type === 'left' || msg.type === 'right') {
        const newMessage = reactive({
          type: msg.type,
          name: msg.name,
          icon: msg.icon,
          msgType: msg.msgType,
          msg: msg.msg,
          src: msg.src || null,
          appear: true,
          finish: true,
          isLoading: false,
        });

        this.addMessageToSession(session, newMessage);
        this.scrollToBottom();

        // 等待一定时间后发送下一条消息
        if (msg.next) {
          setTimeout(() => {
            this.sendMessageById(session, msg.next);
          }, parseFloat(msg.time || '1') * 1000 + 500);
        }

      } else if (msg.type === 'select') {
        const selectMessage = reactive({
          type: 'select',
          msgType: msg.msgType,
          options: msg.options.map(option => ({
            msg: option.msg,
            next: option.next,
          })),
        });

        this.addMessageToSession(session, selectMessage);
        this.currentMessage = selectMessage;
        this.isSelectClose = false;
        this.scrollToBottom();
      }
    },

    addMessageToSession(session, newMessage) {
      session.messages.push(newMessage);
      // 限制总长度
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

      const newMessage = reactive({
        type: 'right',
        name: '开拓者',
        msgType: 'text',
        msg: option.msg,
        icon: "/static/images/穹.png",
        appear: true,
        finish: true
      });

      this.addMessageToSession(this.currentSession, newMessage);
      this.scrollToBottom();

      // 发送对应的下一条消息
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

      // 清空当前会话的消息显示
      this.currentSession.messages = [];

      // 开始发送当前会话的第一条消息
      if (this.currentSession.messages.length > 0) {
        this.sendMessageById(this.currentSession, this.currentSession.messages[0].id);
      } else {
        // 如果会话没有消息，可以添加一条默认消息或其他处理
        console.warn('当前会话没有消息');
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatBoxMiddle) {
          this.$refs.chatBoxMiddle.scrollTo({
            top: this.$refs.chatBoxMiddle.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    },

    onChatBoxMiddleScroll() {
      const cm = this.$refs.chatBoxMiddle;
      if (!cm) return;

      const st = cm.scrollTop;
      if (st < this.lastScrollTop) {
        this.autoScroll = false;
      }
      this.lastScrollTop = st;
    },

    generateChatContext() {
      if (!this.currentSession || !this.currentSession.messages) return [];
      return this.currentSession.messages.map((msg) => {
        if (msg.type === "left") {
          return { role: 'assistant', content: msg.msg, name: msg.name };
        } else if (msg.type === "right") {
          return { role: 'user', content: msg.msg, name: msg.name };
        } else {
          return null;
        }
      }).filter(msg => msg !== null);
    },

    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== '';
    },

    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput) return;

      const userMsg = reactive({
        type: 'right',
        name: '开拓者',
        msgType: 'text',
        msg: trimmedInput,
        icon: "/static/images/穹.png",
        appear: true,
        finish: true
      });
      this.addMessageToSession(this.currentSession, userMsg);
      this.scrollToBottom();

      // 创建AI消息对象并显示加载动画
      const aiMsg = reactive({
        type: 'left',
        name: '三月七',
        msgType: 'text',
        msg: '',
        icon: "/static/images/三月七.png",
        appear: true,
        isLoading: true, // 加载中状态
        finish: false,
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
        aiMsg.msg = '抱歉，无法获取AI的回复。';
        this.scrollToBottom();
      }

      this.userInput = '';
      this.showSendButton = false;
    },
  },
  mounted() {
    // ❶ 直接加载本地 JSON 数据
    try {
      this.loadJSON(tutorialData);
    } catch (error) {
      console.error('Error loading JSON:', error);

      // 如果加载失败，使用原先的测试数据兜底
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
              hover: false,
            }
          ]
        }
      ];
      this.sessionSelected = true;
      this.currentPerson = this.contacts[0];
      this.currentSession = this.contacts[0].sessions[0];
      this.sessionChanged = true;
    }

    // 保持你的滚动逻辑
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
  },
};
</script>
<style scoped>
/* 保持之前的样式不变 */
.form {
  width: 1320px;
  height: 720px;
  background-color: #1b1e27;
  display: flex;
  flex-direction: column;
}

.title-bar {
  padding-left: 32px;
  padding-top: 16px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  background-color: #1b1e27;
  cursor: pointer;
}

.title-icon {
  width: 30px;
  height: 30px;
}

.title {
  color: white;
  font-size: 15px;
  margin-left: 10px;
}

.title-bar:hover {
  background-color: #2d313c;
}

.contacts-list {
  margin-top: 20px;
  width: 290px;
  height: 550px;
  overflow-x: hidden;
  overflow-y: scroll;
}

.contacts-list::-webkit-scrollbar {
  width: 5px;
}

.contacts-list::-webkit-scrollbar-thumb {
  background-color: #535c68;
  border-radius: 10px;
}

.title {
  color: white;
  font-size: 15px; 
}

/* 根据sidebar状态调整布局 */
.content {
  display: flex;
  flex: 1;
  transition: all 0.3s ease-in-out;
}

.left {
  height: 100%;
  padding-left: 32px;
  box-sizing: border-box;
  background-color: #1b1e27;
  transition: width 0.3s ease-in-out, opacity 0.3s ease-in-out;
  overflow: hidden;
}

.left.sidebar-open {
  width: 360px;
  opacity: 1;
}

.left.sidebar-closed {
  width: 0px; /* 折叠状态下的宽度，可根据需要调整 */
  opacity: 1;
}

.right {
  height: 100%;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out, margin-left 0.3s ease-in-out;
}

/* 当sidebar折叠时，.right部分应拓宽以适应新的布局 */
.right.sidebar-open {
  width: 920px;
  margin-left: 20px;
}

.right.sidebar-closed {
  width: calc(1320px - 60px - 20px); /* 计算剩余宽度：总宽度 - 折叠后sidebar宽度 - 间距 */
  margin-left: 20px;
}

.contacts-list {
  margin-top: 20px;
  width: 290px;
  height: 550px;
  overflow-x: hidden;
  overflow-y: scroll;
}

.contacts-list::-webkit-scrollbar {
  width: 0;
}

.chat-box {
  width: 100%;
  height: 620px;
  margin-top: 20px;
  background-color: #e7e7e7;
  border-top-right-radius: 20px;
  opacity: 0.5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transition: opacity 0.3s, background-color 0.3s;
}

.chat-box-active {
  opacity: 1;
  background-color: #d4d4d4;
}

.chat-box-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.chat-box-top {
  height: 55px;
  padding-top: 20px;
  padding-left: 30px;
}

.chat-box-top-name {
  font-size: 18px;
  color: black;
}

.chat-box-top-desc {
  margin-top: 3px;
  font-size: 14px;
  color: #767676;
}

.chat-box-top-hr {
  background-color: #adadaf;
  border: none;
  height: 1px;
  margin: 0;
  box-shadow: 0 0px 10px 10px #d4d4d6;
  position: relative;
  width: 98%;
  margin-top: 10px;
}

.chat-box-bottom-hr {
  background-color: #adadaf;
  border: none;
  height: 1px;
  margin: 0;
  position: relative;
  width: 100%;
}

.chat-box-middle {
  margin-left: 40px;
  overflow-x: hidden;
  overflow-y: scroll;
  flex-grow: 1;
  padding-right: 10px;
}

.chat-box-middle::-webkit-scrollbar {
  width: 3px;
}

.chat-box-middle::-webkit-scrollbar-track {
  background: #c2c4c4;
}

.chat-box-middle::-webkit-scrollbar-thumb {
  background: #545454;
}

.chat-box-middle::-webkit-scrollbar-thumb:hover {
  background: #545454;
}

.chat-box-bottom-grow {
  box-shadow: 0 0px 10px 10px #d4d4d6;
}

.chat-box-bottom {
  position: relative;
  background-color: #cbcbcb;
  max-height: 0;
  transition: max-height 1.5s cubic-bezier(0.25, 1, 0.5, 1),
    opacity 0.25s ease-in-out;
  opacity: 0;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 10px;
}

.chat-box-bottom-expand {
  max-height: 300px;
  opacity: 1;
}

.chat-box-middle-hr {
  background-color: #adadaf;
  border: none;
  height: 1px;
  margin-bottom: 20px;
  width: 98%;
  margin-left: 0;
}

.option {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #e9e9e9;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  transition: background-color 0.1s ease-in-out;
}

.option-hover {
  background-color: #f4f4f4;
}

.option-click {
  background-color: #9b9b9b;
}

.person {
  width: 290px;
  height: 64px;
  border: 2px solid;
  border-color: #727273;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  color: #ababad;
  padding: 10px;
  font-size: 15px;
  background-color: #13141a;
  margin-top: 15px;
  transition: border-color 0.1s ease-in-out, color 0.1s ease-in-out;
  cursor: pointer;
}

.person-hover {
  border-color: #bcbec0;
  color: #bcbec0;
}

.person-select {
  border-color: #8c9093;
  color: #bcbec0;
}

.person-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.session {
  color: #767879;
  opacity: 1;
  width: 265px;
  height: 35px;
  border: 2px solid;
  border-color: #727273;
  margin: 6px auto;
  background-color: #12171d;
  transition: background-color 0.1s ease-in-out, width 0.1s ease-in-out,
    height 0.1s ease-in-out, color 0.1s ease-in-out;
  display: flex;
  align-items: center;
  font-size: 15px;
  cursor: pointer;
}

.session-icon {
  margin: auto 10px;
  width: 20px;
  height: 20px;
}

.session-hover {
  background-color: #bcbcbc;
}

.session-select {
  background-color: #e7e9e7;
  width: 275px;
  height: 40px;
  color: #1a1a1a;
}

.msg-left {
  padding-top: 10px;
  padding-bottom: 20px;
  display: flex;
  align-items: flex-start;
}

.msg-right {
  padding-top: 10px;
  padding-bottom: 20px;
  text-align: right;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.msg-left-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.msg-left-other {
  display: inline-block;
  margin-top: 0;
  vertical-align: top;
}

.msg-left-name {
  display: inline;
  color: #7b7b7b;
  margin-left: 10px;
  vertical-align: top;
}

.msg-left-balloon {
  margin-top: 10px;
  margin-left: 10px;
  background: linear-gradient(to bottom, #ebebeb 0%, #ebebeb 100%);
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 10px;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.msg-left-circle-box {
  margin-top: 5px;
  margin-left: 13px;
  display: flex;
  align-items: center;
}

.msg-left-content {
}

.msg-pic-content {
  width: 150px;
  height: 150px;
  margin: 20px;
}

.msg-left-name-and-content {
  display: inline-block;
  max-width: 300px;
}

.msg-right-icon {
  width: 40px;
  height: 40px;
  margin-right: 20px;
  border-radius: 50%;
}

.msg-right-other {
  display: inline-block;
  margin-top: 0;
  vertical-align: top;
  max-width: 300px;
}

.msg-right-name {
  color: #7b7b7b;
  margin-right: 10px;
}

.msg-right-content {
  margin-top: 10px;
  margin-right: 10px;
  background-color: #d4ba8b;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 10px;
  text-align: left;
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  33% {
    opacity: 1;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

/* 加载动画容器 */
.msg-left-circle-box {
  margin-top: 5px;
  margin-left: 13px;
  display: flex;
  align-items: center;
}

/* 圆点样式 */
.msg-circle-1,
.msg-circle-2,
.msg-circle-3 {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: black;
  display: inline-block;
  opacity: 0;
  animation: blink 1s infinite;
}

.msg-circle-1 {
  animation-delay: 0s;
}

.msg-circle-2 {
  margin-left: 4px;
  animation-delay: 0.2s;
}

.msg-circle-3 {
  margin-left: 4px;
  animation-delay: 0.4s;
}

/* 动画 */
.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-leave-active {
  transition: opacity 0;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
}

.msg-icon-fade-enter-active {
  transition: transform 0.5s cubic-bezier(0.64, 0.57, 0.67, 1.53),
    opacity 0.5s ease-in-out;
}

.msg-icon-fade-enter-from {
  transform: translateY(15px);
  opacity: 0;
}

.msg-name-fade-enter-active {
  transition: opacity 0.5s ease-in-out;
  transition-delay: 0.25s;
}

.msg-name-fade-enter-from {
  opacity: 0;
}

.msg-content-fade-enter-active {
  transition: opacity 0.25s ease-in-out, background-size 0.25s ease-in-out;
}

.msg-content-fade-enter-from {
  opacity: 0;
  background-size: 90% 100%;
}

/* * {
  -webkit-user-select: none;
  user-select: none;
} */

.foot {
  margin-top: 20px;
  text-align: center;
  color: #ffffff;
}

.foot a {
  color: #ffffff;
  text-decoration: none;
}

.foot div {
  margin: 5px 0;
}

.input-area {
  display: flex;
  padding: 10px;
  background-color: #2c2f3a;
  border-top: 1px solid #444;
  flex-shrink: 0;
}

.input-box {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #555;
  border-radius: 20px;
  background-color: #3a3d4e;
  color: #f0f0f0;
  outline: none;
}

.input-box::placeholder {
  color: #bbb;
}

.input-box:focus {
  border-color: #6a7b8c;
  box-shadow: 0 0 5px rgba(106, 123, 140, 0.5);
}

.send-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  background-color: #4e5d6c;
  color: #ffffff;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.send-icon:hover {
  background-color: #6a7b8c;
  transform: scale(1.05);
  opacity: 0.8;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left, .right {
  flex-shrink: 0;
}
</style>
