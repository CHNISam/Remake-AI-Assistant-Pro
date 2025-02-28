<template>
  <div>
    <div class="form">
      <!-- 顶部条作为一个icon，点击可切换sidebar -->
      <div class="title-bar" @click="toggleSidebar">
        <img src="/static/images/icon.png" alt="icon" class="title-icon" />
        <!-- 当 isSidebarOpen 为 true 时显示标题 -->
        <span class="title" v-if="isSidebarOpen">短信</span>
      </div>

      <div
        class="content"
        :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }"
      >
        <div
          class="left"
          :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }"
        >
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
                <img :src="p.icon" alt="" class="person-icon" />
                &nbsp;&nbsp;
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
        <div
          class="right"
          :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen }"
        >
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
                                <img class="msg-pic-content" :src="m.src" alt="" />
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
                          <div v-if="m.msgType === 'text'" class="msg-right-content">
                            {{ m.msg }}
                          </div>
                          <img v-else class="msg-pic-content" :src="m.src" alt="" />
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
                  <!-- 底部水平线 -->
                  <hr
                    v-if="currentSession && currentSession.finish"
                    class="chat-box-middle-hr"
                  />
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
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { characterPrompts } from '/config/promptConfig.js'; // 引入你的角色配置

export default {
  name: 'MessageApp',
  data() {
    return {
      userInput: '',       // 用户输入内容
      showSendButton: false, // 控制发送按钮的显示

      // 大模型API相关
      model: 'glm-zero-preview', // 模型名称
      apiToken: '76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ', // 请使用你自己的Token

      // 联系人数据
      contacts: [],
      sessionSelected: false,
      currentPerson: null,
      currentSession: null,
      sessionChanged: false,
      currentMessage: null, // 指向会话最后一条 select 消息
      maxVisibleMessages: 50,
      isSelectClose: false, // 用于点击选项后把选项折叠
      autoScroll: true,
      lastScrollTop: 0,
      isSidebarOpen: true,
      errorMessage: '' // 错误信息
    };
  },
  computed: {
    // 是否是一个 select 消息
    isSelectMessage() {
      return this.currentMessage && this.currentMessage.type === 'select';
    },
    // 只显示最近 maxVisibleMessages 条
    visibleMessages() {
      return this.currentSession && this.currentSession.messages
        ? this.currentSession.messages.slice(-this.maxVisibleMessages)
        : [];
    },
  },
  methods: {
    // ------------------- 初始化联系人 -------------------
    setupContactsFromConfig() {
      const allCharacters = Object.values(characterPrompts);
      this.contacts = allCharacters.map(char => {
        return {
          name: char.name,
          icon: char.defaultIcon,
          desc: char.desc || '角色简介',
          select: false,
          hover: false,
          sessions: [
            {
              name: `与${char.name}的会话`,
              messages: [],
              select: false,
              hover: false,
              finish: false,
            }
          ],
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

    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== '';
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
      if (session === this.currentSession) return;
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
      if (!this.currentPerson || !this.currentSession) return;
      const config = characterPrompts[this.currentPerson.name];
      const msgs = config && config.welcomeMessages ? [...config.welcomeMessages] : [];
      if (!msgs.length) return;
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
        const newMsg = reactive({
          ...raw,
          appear: false,
          finish: false,
          isLoading: true
        });
        this.addMessageToSession(this.currentSession, newMsg);
        const isRight = raw.type === 'right';
        const appearDelay = isRight ? 100 : 500;
        const finishDelay = isRight ? 250 : 1000;
        setTimeout(() => {
          newMsg.appear = true;
          setTimeout(() => {
            newMsg.finish = true;
            newMsg.isLoading = false;
            if (raw.type === 'select') {
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
      if (last.type === 'select') {
        this.currentMessage = last;
        this.isSelectClose = false;
      } else {
        this.currentMessage = null;
      }
    },

    // 点击选项
    async clickOption(option) {
      if (this.isSelectClose) return;
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
          const newMsg = reactive({
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
            }, 1000);
          }, 500);
        };
        insertChild();
      } else {
        this.userInput = option.msg;
        await this.sendMessage();
      }
    },

    continueQueue() {
      if (
        this.currentSession &&
        this.currentSession._nextIndex != null &&
        this.currentSession._index !== this.currentSession._nextIndex
      ) {
        this.currentSession._index = this.currentSession._nextIndex;
      }
      if (this.currentSession && this.currentSession.insertNext) {
        this.currentSession.insertNext();
      }
    },

    // ------------------- 发送消息 -------------------
    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput) return;
      const userMsg = reactive({
        type: 'right',
        name: '开拓者',
        msgType: 'text',
        msg: trimmedInput,
        icon: '/static/images/穹.png',
        appear: false,
        finish: false,
        isLoading: true,
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
      const aiMsg = reactive({
        type: 'left',
        name: this.currentPerson ? this.currentPerson.name : '系统',
        msgType: 'text',
        msg: '正在获取AI回复...',
        icon: characterPrompts[this.currentPerson.name]?.defaultIcon || '/static/images/default.png',
        appear: true,
        isLoading: true,
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
        if (!this.currentSession.finish) {
          this.generateNextUserOptions();
        }
      } catch (error) {
        aiMsg.isLoading = false;
        aiMsg.finish = true;
        aiMsg.msg = '抱歉，无法获取AI的回复。';
        this.scrollToBottom();
      }
      this.userInput = '';
      this.showSendButton = false;
    },

    // ------------------- 自动生成下一步用户可选回复 -------------------
    async generateNextUserOptions() {
      if (!this.currentSession) return;
      try {
        const conversation = this.generateChatContext();
        // 并发请求生成2个建议（满足UI限制且字数严格限制）
        const suggestions = await this.generateMultipleSuggestions(conversation);
        if (!suggestions || suggestions.length === 0) return;
        const selectMsg = this.buildSelectMessage(suggestions);
        this.addMessageToSession(this.currentSession, selectMsg);
        this.isSelectClose = false;
        this.scrollToBottom();
      } catch (err) {
        console.error("生成下一步用户回复失败：", err);
      }
    },

    buildSelectMessage(suggestionsArray) {
      return reactive({
        type: 'select',
        name: '建议',
        icon: characterPrompts[this.currentPerson.name]?.defaultIcon || '/static/images/default.png',
        appear: true,
        finish: true,
        isLoading: false,
        options: suggestionsArray.map(text => ({
          msg: text,
          hover: false,
          click: false
        }))
      });
    },

    // ------------------- 大模型AI回复 -------------------
    async fetchAIResponse(conversation) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          data: {
            model: this.model,
            messages: [
              {
                role: 'system',
                content: this.currentPerson && characterPrompts[this.currentPerson.name]
                  ? characterPrompts[this.currentPerson.name].systemPrompt
                  : '这是一个默认的 systemPrompt，用于兜底处理。'
              },
              ...conversation.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            ],
            stream: false,
          },
          success: res => {
            if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
              resolve(res.data.choices[0].message.content.trim());
            } else {
              reject(new Error(`API请求失败，状态码：${res.statusCode}，返回数据：${JSON.stringify(res.data)}`));
            }
          },
          fail: error => {
            reject(new Error(`请求失败: ${error}`));
          },
        });
      }).catch(error => {
        console.error('AI回复错误:', error);
        return '抱歉，无法获取AI的回复。';
      });
    },

    // ------------------- 并发生成单个建议 -------------------
    async fetchSingleSuggestion(conversation) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          data: {
            model: this.model,
            temperature: 0,
            messages: [
              {
                role: 'system',
                content:
                  '请扮演游戏《崩坏：星穹铁道》中的开拓者，一名性格古怪、幽默风趣的冒险者。请站在我们的角度，给出一个简短建议，回复不超过25字。'
              },
              ...conversation.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            ],
            stream: false,
          },
          success: res => {
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
              } catch(e) {
                const regex = /(?:建议|选项)[：:]\s*([^，。]+)/;
                const match = content.match(regex);
                if (match && match[1]) {
                  suggestion = match[1].trim();
                } else {
                  suggestion = content;
                }
              }
              // 截断回复，确保不超过25字
              if (suggestion.length > 25) {
                suggestion = suggestion.substring(0, 25);
              }
              resolve(suggestion);
            } else {
              console.error("Single suggestion API返回数据不符合预期:", res);
              reject(new Error(`生成建议API请求失败，状态码：${res.statusCode}，返回数据：${JSON.stringify(res.data)}`));
            }
          },
          fail: error => {
            console.error("Single suggestion API请求失败:", error);
            reject(new Error(`请求失败: ${error}`));
          },
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
      } catch(e) {
        console.error("并发生成建议失败：", e);
        throw e;
      }
    },

    // ------------------- 独立的请求函数 -------------------
    makeRequest(conversation) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          data: {
            model: this.model,
            temperature: 0,
            messages: [
              {
                role: 'system',
                content: `你是一个对话助手，请根据上下文给出2~3个简短建议，输出必须是标准 JSON 数组，例如：["建议1","建议2"]。`
              },
              ...conversation.map(msg => ({
                role: msg.role,
                content: msg.content,
              }))
            ],
            stream: false,
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
          },
        });
      });
    },

    // 将当前会话消息转换为模型所需的上下文
    generateChatContext() {
      if (!this.currentSession || !this.currentSession.messages) return [];
      return this.currentSession.messages.map(msg => {
        if (msg.type === 'left') {
          return { role: 'assistant', content: msg.msg };
        } else {
          return { role: 'user', content: msg.msg };
        }
      });
    },
  },

  mounted() {
    // 生成联系人
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
      if (!cm) return;
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
/* 这里是你的样式，原样保留即可 */
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
  width: 0px;
  opacity: 1;
}

.right {
  height: 100%;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out, margin-left 0.3s ease-in-out;
}

.right.sidebar-open {
  width: 920px;
  margin-left: 20px;
}

.right.sidebar-closed {
  width: calc(1320px - 60px - 20px);
  margin-left: 20px;
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
  transition: max-height 1.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.25s;
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
  width: 50px;
  height: 50px;
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
  align-items: flex-start;
  justify-content: flex-end;
}

.msg-left-icon {
  display: inline-block;
  vertical-align: top;
  align-self: flex-start;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.msg-left-name-and-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 300px;
}

.msg-left-name {
  color: #7b7b7b;
  margin-bottom: 5px;
}

.msg-left-balloon {
  margin-top: 10px;
  background: #ebebeb;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 10px;
  display: inline-block;
}

.msg-right-other {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin-right: 10px;
}

.msg-right-name {
  color: #7b7b7b;
  margin-bottom: 5px;
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

.msg-pic-content {
  width: 150px;
  height: 150px;
  margin: 20px;
}

.msg-right-icon {
  display: inline-block;
  vertical-align: top;
  width: 50px;
  height: 50px;
  margin-right: 20px;
  border-radius: 50%;
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

.msg-left-circle-box {
  margin-top: 5px;
  margin-left: 13px;
  display: flex;
  align-items: center;
}

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
</style>