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
import { characterPrompts } from '/config/promptConfig.js'; // 引入你的prompt配置

export default {
  name: 'MessageApp',
  data() {
    return {
      // 用户输入内容
      userInput: '',
      showSendButton: false, // 控制发送按钮的显示
      // 大模型API相关
      model: 'glm-4-flash', // 模型名称（固定值）
      apiToken: '76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ', // 你的token
      // 天气API相关
      amapApiKey: '79452bccf16e1cd79877f79614b3bd23',

      // 联系人数据（直接从 promptConfig 中构建）
      contacts: [],
      sessionSelected: false,
      currentPerson: null,
      currentSession: null,
      sessionChanged: false,
      currentMessage: null, // 指向会话最后一条select消息
      maxVisibleMessages: 50,
      isSelectClose: false, // 用于点击选项后把选项折叠
      autoScroll: true,
      lastScrollTop: 0,
      isSidebarOpen: true,
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
    // 从 promptConfig 里生成联系人
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
      // 如果用户向上滚动，则取消自动滚动
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
      if (session === this.currentSession) {
        return;
      }
      // 先取消已有选中
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

      // 如果当前会话没有消息，注入开场白
      if (!session.messages || session.messages.length === 0) {
        this.initSessionWithWelcome();
      }
      // [CHANGED CODE HERE] 每次切换会话后检查最后一条消息是否为select
      this.updateCurrentMessage(session);

      this.scrollToBottom();
    },

    // [CHANGED CODE HERE] 改成读取 characterPrompts 的 welcomeMessages
    initSessionWithWelcome() {
      if (!this.currentPerson || !this.currentSession) return;
      const config = characterPrompts[this.currentPerson.name];
      const msgs = config && config.welcomeMessages ? config.welcomeMessages : [];
      // 给所有消息加上 appear: true / finish: true
      const welcome = msgs.map(m => ({ ...m, appear: true, finish: true }));
      this.currentSession.messages = welcome;
    },

    // [CHANGED CODE HERE] 每次插入消息后，更新一下 currentMessage
    addMessageToSession(session, newMessage) {
      session.messages.push(newMessage);
      const MAX_MESSAGES = 100;
      if (session.messages.length > MAX_MESSAGES) {
        session.messages.splice(0, session.messages.length - MAX_MESSAGES);
      }
      this.updateCurrentMessage(session);
    },

    // [CHANGED CODE HERE] 用来判断会话最后一条是否是 select
    updateCurrentMessage(session) {
      if (!session || !session.messages || session.messages.length === 0) {
        this.currentMessage = null;
        return;
      }
      const last = session.messages[session.messages.length - 1];
      if (last.type === 'select') {
        this.currentMessage = last;
        this.isSelectClose = false; // 允许点击
      } else {
        this.currentMessage = null;
      }
    },

    // 点击选项后，若有 children 就追加
    async clickOption(option) {
      if (this.isSelectClose) {
        return;
      }
      option.click = true;
      this.isSelectClose = true;

      // [CHANGED CODE HERE] 插入 children
      if (option.children && Array.isArray(option.children)) {
        option.children.forEach(childMsg => {
          const newMsg = { ...childMsg, appear: true, finish: true };
          this.addMessageToSession(this.currentSession, newMsg);
        });
      }
    },

    // ------------------- 发送消息 -------------------
    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput) return;

      // 1. 先把用户的消息加到右侧
      const userMsg = {
        type: 'right',
        name: '开拓者',
        msgType: 'text',
        msg: trimmedInput,
        icon: '/static/images/穹.png',
        appear: true,
        finish: true,
      };
      this.addMessageToSession(this.currentSession, userMsg);
      this.scrollToBottom();

      // 2. 判断是否问天气
      const intent = await this.checkMessageIntentWithLLM(trimmedInput);
      console.log('意图识别结果:', intent);

      if (intent === 'weather') {
        // 如果是天气
        const matchedCities = this.getCityCodes(trimmedInput);
        if (matchedCities.length === 0) {
          // 无法识别到城市 -> 直接让AI给个回答
          const aiMsg = reactive({
            type: 'left',
            name: '天气查询',
            msgType: 'text',
            msg: '无法识别你想查的城市，可以再说具体点吗？',
            icon:
              characterPrompts[this.currentPerson.name]?.defaultIcon ||
              '/static/images/default.png',
            appear: true,
            isLoading: false,
            finish: true,
          });
          this.addMessageToSession(this.currentSession, aiMsg);
          this.scrollToBottom();
        } else {
          // 对每个匹配到的城市发起查询
          matchedCities.forEach(async city => {
            const loadingMsg = reactive({
              type: 'left',
              name: '天气查询',
              msgType: 'text',
              msg: `正在查询${city.name}天气...`,
              icon:
                characterPrompts[this.currentPerson.name]?.defaultIcon ||
                '/static/images/weather.png',
              appear: true,
              isLoading: true,
              finish: false,
            });
            this.addMessageToSession(this.currentSession, loadingMsg);
            this.scrollToBottom();

            try {
              const weatherInfo = await this.fetchWeather(city.code);
              loadingMsg.isLoading = false;
              loadingMsg.finish = true;

              if (weatherInfo) {
                loadingMsg.msg = `
城市: ${weatherInfo.city}
天气: ${weatherInfo.weather}
温度: ${weatherInfo.temperature}℃
风向: ${weatherInfo.winddirection}
风力: ${weatherInfo.windpower}级
湿度: ${weatherInfo.humidity}%
                `.trim();
              } else {
                loadingMsg.msg = `抱歉，无法获取到${city.name}的天气信息。`;
              }
              this.scrollToBottom();
            } catch (e) {
              console.error(`天气查询接口出错 (${city.name})`, e);
              loadingMsg.isLoading = false;
              loadingMsg.finish = true;
              loadingMsg.msg = `天气服务暂不可用 (${city.name})。`;
              this.scrollToBottom();
            }
          });
        }
      } else {
        // 3. 如果不是天气，就让大模型根据当前角色的 systemPrompt 来回答
        const aiMsg = reactive({
          type: 'left',
          name: this.currentPerson ? this.currentPerson.name : '系统',
          msgType: 'text',
          msg: '正在获取AI回复...',
          icon:
            characterPrompts[this.currentPerson.name]?.defaultIcon ||
            '/static/images/default.png',
          appear: true,
          isLoading: true,
          finish: false,
        });
        this.addMessageToSession(this.currentSession, aiMsg);
        this.scrollToBottom();

        // 构造上下文
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
      }

      // 4. 清空输入
      this.userInput = '';
      this.showSendButton = false;
    },

    // 调用大模型做“意图识别”
    async checkMessageIntentWithLLM(userMsg) {
      return new Promise(resolve => {
        const systemPrompt = `
你是一个分类器，用户会发来一句话。你需要判断这句话是否是对“天气”的询问。
如果用户是在查询某地的天气，请只回答 "weather"。
如果不是在查询天气，包括只是感慨天气不错，请只回答 "other"。
只输出这一个词，不要带多余内容。
        `.trim();

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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMsg }
            ],
            stream: false,
          },
          success: res => {
            if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
              const content = res.data.choices[0].message.content.trim().toLowerCase();
              if (content === 'weather') {
                resolve('weather');
              } else {
                resolve('other');
              }
            } else {
              console.error('意图识别API请求失败，状态码：', res.statusCode);
              resolve('other');
            }
          },
          fail: error => {
            console.error('意图识别时出现错误:', error);
            resolve('other');
          },
        });
      });
    },

    // 让大模型生成回复
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
                content: characterPrompts[this.currentPerson.name]
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
              reject(new Error(`API请求失败，状态码：${res.statusCode}`));
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

    // 调用高德API查询天气
    async fetchWeather(cityCode) {
      return new Promise(resolve => {
        const url = 'https://restapi.amap.com/v3/weather/weatherInfo';
        const params = {
          key: this.amapApiKey,
          city: cityCode,
          extensions: 'base',
          output: 'json'
        };

        wx.request({
          url: url,
          method: 'GET',
          data: params,
          success: res => {
            const data = res.data;
            if (data.status === '1' && data.lives && data.lives.length > 0) {
              resolve(data.lives[0]);
            } else {
              console.error('天气查询失败，错误信息:', data.info);
              resolve(null);
            }
          },
          fail: error => {
            console.error('天气查询失败:', error);
            resolve(null);
          },
        });
      });
    },

    // 更多城市名匹配
    getCityCodes(userInput) {
      const cityMap = {
        '北京': '110000',
        '上海': '310000',
        '广州': '440100',
        '深圳': '440300',
        '杭州': '330100',
        '成都': '510100',
        '重庆': '500000',
        '天津': '120000',
        '武汉': '420100',
        '西安': '610100',
        '南京': '320100',
        '苏州': '320500',
        '长沙': '430100',
        '青岛': '370200',
        '大连': '210200',
        '厦门': '350200',
        '广东': '440000',
        '江苏': '320000',
        '四川': '510000',
        '河北': '130000',
        '河南': '410000',
        '山东': '370000',
        '辽宁': '210000',
        '浙江': '330000',
        '湖北': '420000',
        '湖南': '430000',
        '福建': '350000',
        '安徽': '340000',
        '江西': '360000',
        '吉林': '220000',
        '佛山': '440600',
        '东莞': '441900',
      };

      const matchedCityCodes = [];
      for (const cityName in cityMap) {
        if (userInput.includes(cityName)) {
          matchedCityCodes.push({
            name: cityName,
            code: cityMap[cityName]
          });
        }
      }
      return matchedCityCodes;
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
    this.setupContactsFromConfig();

    // 默认选中第一个联系人和第一个会话
    if (this.contacts.length > 0) {
      this.selectPerson(this.contacts[0]);
      if (this.contacts[0].sessions.length > 0) {
        this.selectSession(this.contacts[0], this.contacts[0].sessions[0]);
        // 这里也可以再手动触发一次 update
        this.updateCurrentMessage(this.contacts[0].sessions[0]);
      }
    }

    // 定时检查是否需要自动滚动到底
    setInterval(() => {
      const cm = this.$refs.chatBoxMiddle;
      if (!cm) return;
      if (
        Math.abs(cm.scrollHeight - cm.scrollTop - cm.clientHeight) < 1
      ) {
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
/* 你的样式基本保持不变，下方无改动 */
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

.left,
.right {
  flex-shrink: 0;
}
</style>
