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
    </div>
  </div>
</template>



<script>
import { reactive } from 'vue';
// 引入刚才写好的 prompt 配置
import { characterPrompts } from '/config/promptConfig.js'; 

export default {
  name: 'MessageApp',
  data() {
    return {
      // 用户输入内容
      userInput: '',
      showSendButton: false, // 控制发送按钮的显示
      // 大模型API相关
      model: 'glm-4-flash', // 模型名称（固定值）
      apiToken: '76915445ad0955e6442a0aa6d24ad251.27G8TUC8AM9euXxQ',  // 你申请到的token，比如 "76915445xxxx"
      // 天气API相关
      amapApiKey: '79452bccf16e1cd79877f79614b3bd23', 

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

    // ------------------- 优化：大模型意图识别 -------------------
    /**
     * 调用大模型判断用户消息是否为"天气"查询
     * 输出只有两个可能： "weather" 或 "other"
     */
    async checkMessageIntentWithLLM(userMsg) {
      return new Promise((resolve) => {
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
            'Authorization': `Bearer ${this.apiToken}` // 确保使用正确的格式
          },
          data: {
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMsg }
            ],
            stream: false
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
              // 拿到大模型返回的文本
              const content = res.data.choices[0].message.content.trim().toLowerCase();
              if (content === 'weather') { // 使用严格比较
                resolve('weather');
              } else {
                resolve('other');
              }
            } else {
              console.error('意图识别API请求失败，状态码：', res.statusCode);
              resolve('other');
            }
          },
          fail: (error) => {
            console.error('意图识别时出现错误:', error);
            resolve('other');
          }
        });
      });
    },

    // -------------- 优化后的大模型回复函数 (普通对话) --------------
    async fetchAIResponse(conversation) {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}` // 确保使用正确的格式
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
      }).catch((error) => {
        console.error('AI回复错误:', error);
        return '抱歉，无法获取AI的回复。';
      });
    },

    // ------------------- 优化后的天气查询函数 (前端直接请求高德API) -------------------
    async fetchWeather(cityCode) {
      return new Promise((resolve, reject) => {
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
          success: (res) => {
            const data = res.data;
            if (data.status === '1' && data.lives && data.lives.length > 0) {
              resolve(data.lives[0]);
            } else {
              console.error('天气查询失败，错误信息:', data.info);
              resolve(null);
            }
          },
          fail: (error) => {
            console.error('天气查询失败:', error);
            resolve(null);
          }
        });
      });
    },

    // ------------------- 扩展：更全面的城市名映射 -------------------
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
        // 添加更多城市
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

    // 从XML文档加载聊天记录
    loadXML(xml) {
      this.contacts = []; // 清空数组先

      // 遍历所有联系人
      const persons = xml.getElementsByTagName('person');

      for (let person of persons) {
        const newPerson = {
          name: person.getAttribute('name'),
          icon: person.getAttribute('icon'),
          desc: person.getAttribute('desc'),
          sessions: [],
          select: false,
          hover: false,
        };

        this.contacts.push(newPerson);
        // 遍历联系人中的所有会话，并构建必要信息
        const sessions = person.getElementsByTagName('session');

        for (let session of sessions) {
          newPerson.sessions.push({
            name: session.firstElementChild.textContent,
            messages: [],
            sessionNode: session,
            nextNode: session.firstElementChild,
            select: false,
            hover: false,
            finish: false,
          });
        }
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

    async sendNextNode(session) {
      if (!session.nextNode) return;

      switch (session.nextNode.tagName) {
        case 'left':
        case 'right': {
          const msgObj = reactive({
            type: session.nextNode.tagName,
            name: session.nextNode.getAttribute('name'),
            icon: session.nextNode.getAttribute('icon'), // 确保从节点获取正确的icon
            msgType: session.nextNode.getAttribute('type'),
            msg: session.nextNode.textContent,
            src: session.nextNode.getAttribute('src'),
            appear: false,
            finish: false,
            isLoading: false,
          });

          this.currentMessage = msgObj;
          const finishTime =
            session.nextNode.tagName === 'left'
              ? parseFloat(session.nextNode.getAttribute('time') || '2') * 1000
              : 250;

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
            while (next.parentNode.tagName !== 'session') {
              if (next.parentNode.tagName === 'option') {
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

        case 'select': {
          const options = [];
          for (let option of session.nextNode.children) {
            options.push({
              msg: option.getAttribute('msg'),
              nextNode: option.firstElementChild,
              click: false,
              hover: false,
            });
          }
          const msgObj = reactive({
            type: 'select',
            msgType: session.nextNode.getAttribute('type'),
            options,
            name: this.currentPerson ? this.currentPerson.name : '系统', // 确保有name字段
            icon: this.currentPerson ? this.currentPerson.icon : '/static/images/default.png', // 使用当前角色的icon
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
        } else {
          return { role: 'user', content: msg.msg, name: msg.name };
        }
      });
    },

    toggleSendButton() {
      this.showSendButton = this.userInput.trim() !== '';
    },

    // ------------------- 关键：集成大模型意图判断 -------------------
    async sendMessage() {
      const trimmedInput = this.userInput.trim();
      if (!trimmedInput) return;

      // 1. 将用户消息插到右侧气泡
      const userMsg = {
        type: 'right',
        name: '开拓者',
        msgType: 'text',
        msg: trimmedInput,
        icon: "/static/images/穹.png", // 用户头像固定
        appear: true,
        finish: true
      };
      this.addMessageToSession(this.currentSession, userMsg);
      this.scrollToBottom();

      // 2. 调用大模型做“意图识别”
      const intent = await this.checkMessageIntentWithLLM(trimmedInput);
      console.log('意图识别结果:', intent);

      // 3. 如果是天气查询，则调用天气API
      if (intent === 'weather') {
        const matchedCities = this.getCityCodes(trimmedInput);

        if (matchedCities.length === 0) {
          // 无法识别城市名称，调用大模型处理
          const aiMsg = reactive({
            type: 'left',
            name: '天气查询', // 设置为“天气查询”
            msgType: 'text',
            msg: '正在处理您的天气查询请求...',
            icon: characterPrompts[this.currentPerson.name]
              ? characterPrompts[this.currentPerson.name].defaultIcon
              : '/static/images/default.png', // 使用AI角色的默认头像
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
          } catch (error) {
            aiMsg.isLoading = false;
            aiMsg.finish = true;
            aiMsg.msg = '抱歉，无法获取AI的回复。';
            this.scrollToBottom();
          }
        } else {
          // 对于每个匹配到的城市，插入一条“正在查询天气...”的消息，并发起 API 请求
          matchedCities.forEach(async (city) => {
            // 插入“正在查询天气...”的消息
            const weatherMsgLoading = reactive({
              type: 'left',
              name: '天气查询', // 设置为“天气查询”
              msgType: 'text',
              msg: `正在查询${city.name}的天气...`,
              icon: characterPrompts[this.currentPerson.name]
                ? characterPrompts[this.currentPerson.name].weatherIcon || characterPrompts[this.currentPerson.name].defaultIcon
                : '/static/images/weather.png', // 使用AI角色的天气相关头像或默认
              appear: true,
              isLoading: true,
              finish: false
            });
            this.addMessageToSession(this.currentSession, weatherMsgLoading);
            this.scrollToBottom();

            try {
              const weatherInfo = await this.fetchWeather(city.code);
              weatherMsgLoading.isLoading = false;
              weatherMsgLoading.finish = true;

              if (weatherInfo) {
                weatherMsgLoading.msg = `
城市: ${weatherInfo.city}
天气: ${weatherInfo.weather}
温度: ${weatherInfo.temperature}℃
风向: ${weatherInfo.winddirection}
风力: ${weatherInfo.windpower}级
湿度: ${weatherInfo.humidity}%
                `.trim();
              } else {
                weatherMsgLoading.msg = `抱歉，无法获取到${city.name}的天气信息。`;
              }
              this.scrollToBottom();
            } catch (e) {
              console.error(`天气查询接口出错 (${city.name})`, e);
              weatherMsgLoading.isLoading = false;
              weatherMsgLoading.finish = true;
              weatherMsgLoading.msg = `天气服务暂不可用 (${city.name})。`;
              this.scrollToBottom();
            }
          });
        }
      } else {
        // 4. 如果不是天气查询，则走原有的 AI 回复流程
        const aiMsg = reactive({
          type: 'left',
          name: this.currentPerson ? this.currentPerson.name : '系统', // 动态读取当前联系人的名字
          msgType: 'text',
          msg: '正在获取AI回复...',
          icon: characterPrompts[this.currentPerson.name]
            ? characterPrompts[this.currentPerson.name].defaultIcon
            : '/static/images/default.png', // 使用AI角色的默认头像
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
        } catch (error) {
          aiMsg.isLoading = false;
          aiMsg.finish = true;
          aiMsg.msg = '抱歉，无法获取AI的回复。';
          this.scrollToBottom();
        }
      }

      // 清空输入框
      this.userInput = '';
      this.showSendButton = false;
    },
  },
  mounted() {
    // 从 /public/tutorial.xml 加载默认XML
    wx.request({
      url: '/public/tutorial.xml',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const parser = new DOMParser();
          const xml = parser.parseFromString(res.data, 'text/xml');
          this.loadXML(xml.documentElement);

          // 可选：自动选择第一个联系人和第一个会话
          // if (this.contacts.length > 0) {
          //   this.selectPerson(this.contacts[0]);
          //   if (this.contacts[0].sessions.length > 0) {
          //     this.selectSession(this.contacts[0], this.contacts[0].sessions[0]);
          //   }
          // }
        } else {
          throw new Error(`HTTP error! Status: ${res.statusCode}`);
        }
      },
      fail: (error) => {
        console.error('Error loading XML:', error);

        // 提供一个默认联系人和会话
        this.contacts = [
          {
            name: "测试联系人",
            icon: "/static/images/icon.png",
            desc: "这是一个测试联系人描述",
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
                    isLoading: false,
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
      }
    });

    // 定时检查是否需要自动滚动到底
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
