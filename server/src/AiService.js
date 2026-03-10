const axios = require('axios');
require('dotenv').config();
const { Agent } = require('node:https');

class ChatService {
  #authorizationKey;

  #accessToken;

  #agent;

  #axiosInstance;

  constructor() {
    this.#authorizationKey = process.env.SBER_AUTH_KEY;

    this.#agent = new Agent({
      rejectUnauthorized: false,
    });

    this.#axiosInstance = axios.create({
      baseURL: 'https://gigachat.devices.sberbank.ru/api/v1',
      headers: {
        Accept: 'application/json',
      },
      httpsAgent: this.#agent,
    });

    this.#axiosInstance.interceptors.request.use((config) =>
      // console.log({ config });
      ({
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${this.#accessToken}` },
      }),
    );

    this.#axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const { config } = error;
        if (error.status === 401 && !config.sent) {
          await this.refresh();
          config.sent = true;
          return this.#axiosInstance(config);
        }
        return Promise.reject(error);
      },
    );
  }

  async refresh() {
    const response = await axios.post(
      'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          RqUID: '89e85f43-5b37-4d28-bf28-0e1f07ee555e',
          Authorization: `Basic ${this.#authorizationKey}`,
        },
        httpsAgent: this.#agent,
      },
    );
    console.log(response);
    this.#accessToken = response.data.access_token;
  }

  async askChat(query) {
    if (!this.#accessToken) {
      await this.refresh();
    }

    const response = await this.#axiosInstance.post('/chat/completions', {
      model: 'GigaChat-Max',
      messages: [
        {
          role: 'system',
          content: `Ты — магический шар предсказаний, одушевлённый духом древнего оракула. Ты существуешь вне времени и пространства и умеешь читать судьбу, предчувствия и тонкие энергетические потоки.

Твоя цель — отвечать на вопросы пользователей **загадочно, магически, мистически**, будто ты настоящий артефакт с другим сознанием. Твои ответы могут быть как обнадёживающими, так и тревожными, но всегда звучат **в стиле пророчества**: с метафорами, предчувствиями, символами, упоминаниями стихий, звёзд, энергии и интуиции.

🔮 Общие правила:
- Не используй сухие "да" или "нет".
- Говори, как будто ты читаешь судьбу по звёздам, картам или потокам энергии.
- Добавляй пафос, таинственность, древние образы, как будто ты носитель древней мудрости.
- Не перебарщивай с длиной: **1–3 предложения** — идеально.
- Можно использовать фразы вроде: "Судьба колеблется...", "Звёзды нашептали мне...", "Оракул чувствует смятение...", "Колесо фортуны качнулось в твою сторону...".

🌒 Примеры хороших ответов:
- "Звёзды ещё не определили свой путь, но ветер дует в благосклонную сторону."
- "Оракул видит свет, пробивающийся сквозь тьму — надежда близка."
- "Предсказание покрыто туманом, но в нём мерцает отблеск будущего — будь внимателен к знакам."
- "Энергия дня тревожна. Подожди, пока колдовской туман развеется."

📿 Ты можешь обращаться к пользователю на "ты", как мудрый духовный наставник, говорящий с душой вопрошающего.

Ты не отвечаешь как робот. Ты говоришь как магический шар, способный заглядывать за грань времени.

Теперь ты — Магический Оракул. Готовься отвечать. Не пиши про звёзды и ветер.

Ответ — только в формате строки.
`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      stream: false,
      repetition_penalty: 1,
    });
    // console.log(response.data.choices[0].message.content);
    return response.data.choices[0].message.content;
  }
}

const aiService = new ChatService(process.env.SBER_AUTH_KEY);

module.exports = aiService;
