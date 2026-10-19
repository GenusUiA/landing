import { FormEvent, useRef, useState } from "react";

type RequestType = "once" | "subscription" | "question";

const products = [
  {
    name: "Эфиопия Иргачеффе",
    type: "Фильтр · светлая",
    notes: "Бергамот · жасмин · персик",
    price: "32 BYN",
    amount: "250 г",
    image:
      "https://images.unsplash.com/photo-1581665334510-73054f4a85e2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: "center 55%",
  },
  {
    name: "Колумбия Уила",
    type: "Фильтр · светлая",
    notes: "Карамель · красное яблоко",
    price: "29 BYN",
    amount: "250 г",
    image:
      "https://images.unsplash.com/photo-1558618666-4bfc6a7b2b93?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: "center",
  },
  {
    name: "Бразилия Серрадо",
    type: "Эспрессо",
    notes: "Фундук · темный шоколад",
    price: "26 BYN",
    amount: "250 г",
    image:
      "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: "center",
  },
  {
    name: "Дрип-пакеты · Ассорти",
    type: "В дорогу и домой",
    notes: "Эфиопия · Колумбия · Бразилия",
    price: "18 BYN",
    amount: "10 шт.",
    image:
      "https://images.unsplash.com/photo-1595259515259-b3d1f7b3c0a3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    position: "center 30%",
  },
];

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h13M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const BeanMark = () => (
  <svg aria-hidden="true" viewBox="0 0 42 42" fill="none">
    <path
      d="M33.7 7.4c6.1 6.1 2.8 19.2-5.6 27.6-6 6-13.6 3.8-18.2-.8-4.6-4.6-6.7-12.2-.8-18.2C17.5 7.6 27.6 1.3 33.7 7.4Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M31.8 8.8c-4 9.5-14.3 9.2-20.5 23.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

function formatPhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("375")) digits = digits.slice(3);
  digits = digits.slice(0, 9);
  let result = "+375";
  if (digits.length > 0) result += ` (${digits.slice(0, 2)}`;
  if (digits.length >= 2) result += ")";
  if (digits.length > 2) result += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) result += `-${digits.slice(5, 7)}`;
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`;
  return result;
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    source_page: window.location.href,
  };
}

const TOPIC_MAP: Record<RequestType, string> = {
  once: "разовый заказ",
  subscription: "подписка",
  question: "вопрос",
};

export default function App() {
  const [requestType, setRequestType] = useState<RequestType>("once");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLElement>(null);

  const goToForm = (type: RequestType, product = "") => {
    setRequestType(type);
    setSelectedProduct(product);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const digits = phone.replace(/\D/g, "").replace(/^375/, "");
    if (!/^(25|29|33|44)\d{7}$/.test(digits)) {
      setPhoneError("Введите корректный номер операторов Беларуси: A1, МТС или Life");
      return;
    }

    setPhoneError("");
    setServerError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    let comment = String(formData.get("comment") || "").trim();

    if (selectedProduct) {
      comment = comment ? `Товар: ${selectedProduct}. ${comment}` : `Товар: ${selectedProduct}`;
    }

    const payload = {
      name,
      phone: `+375${digits}`,
      topic: TOPIC_MAP[requestType],
      comment,
      ...getUtmParams(),
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Не удалось отправить заявку. Попробуйте позже.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Ошибка сети. Проверьте соединение или позвоните нам напрямую.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="Кварта — на главную">
          <BeanMark />
          <span>Кварта</span>
        </a>
        <nav aria-label="Основная навигация">
          <a href="#coffee">Кофе</a>
          <a href="#subscription">Подписка</a>
          <a href="#delivery">Доставка</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <button className="header-cta" onClick={() => goToForm("once")}>
          Заказать <Arrow />
        </button>
      </header>

      <section className="hero section-shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow">Обжарка кофе · Минск · Работаем с 2019</div>
          <h1>
            Четверг – обжарка 
            <br />
            <em>Пятница – у вас</em>
          </h1>
          <p className="hero-lead">
            Обжариваем зерно микро-партиями по 5 кг. Никаких складских запасов — только вкус,
            который успел раскрыться, а не состариться
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="#coffee">
              Выбрать зерно <Arrow />
            </a>
            <a className="button button-link" href="#subscription">
              Оформить подписку
            </a>
          </div>
          <div className="founders">
            <span className="founder-avatar">А</span>
            <span className="founder-avatar second">Д</span>
            <p>
              <strong>Аня и Дмитрий</strong>
              <br />
              экс-бариста и основатели «Кварты»
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=90&w=1400"
            alt="Обжарщик проверяет свежие кофейные зерна"
          />
          <div className="roast-note">
            <span className="note-day">ЧТ</span>
            <span>
              <strong>Обжариваем по четвергам</strong>
              <small>развозим по пятницам</small>
            </span>
          </div>
          <div className="image-caption">Зерно у вас на 1–3 день после обжарки</div>
        </div>
      </section>

      <section className="freshness section-shell" aria-labelledby="freshness-title">
        <div className="section-intro">
          <span className="section-number">01</span>
          <div>
            <p className="kicker">Не про «кофе покрепче»</p>
            <h2 id="freshness-title">Свежесть можно распробовать</h2>
          </div>
        </div>
        <div className="freshness-layout">
          <p className="large-copy">
            Кофе – живой продукт. После обжарки ему нужно несколько дней, чтобы раскрыть
            сладость, аромат и характер. Лучший вкус живет в первых неделях, а не месяцах.
          </p>
          <div className="week">
            <article>
              <span>Чт</span>
              <div>
                <h3>Свежая обжарка</h3>
                <p>Микро-партии по 5 кг под ваши заказы.</p>
              </div>
            </article>
            <article>
              <span>Пт</span>
              <div>
                <h3>Доставка по Минску</h3>
                <p>Курьер забирает кофе прямо из мастерской.</p>
              </div>
            </article>
            <article>
              <span>Сб</span>
              <div>
                <h3>Идеальный кофе дома</h3>
                <p>На выходных зерно уже готово раскрыться в чашке.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="catalog section-shell" id="coffee" aria-labelledby="catalog-title">
        <div className="section-intro catalog-heading">
          <span className="section-number">02</span>
          <div>
            <p className="kicker">Обжарим в ближайший четверг</p>
            <h2 id="catalog-title">Зерно этой недели</h2>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.name}>
              <div className="product-image">
                <img src={product.image} alt="" style={{ objectPosition: product.position }} />
                <span className="product-amount">{product.amount}</span>
              </div>
              <div className="product-info">
                <p className="product-type">{product.type}</p>
                <h3>{product.name}</h3>
                <p className="product-notes">{product.notes}</p>
                <div className="product-bottom">
                  <strong>{product.price}</strong>
                  <button onClick={() => goToForm("once", product.name)}>
                    Выбрать <Arrow />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="subscription section-shell" id="subscription">
        <div className="subscription-visual">
          <img
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1000"
            alt="Две свежие пачки кофе по подписке"
            className="subscription-image"
          />
        </div>

        <div className="subscription-copy">
          <p className="kicker">Кофе заканчивается. Подписка — нет.</p>
          <h2>Свежий кофе по подписке</h2>
          <p>
            Две пачки по 250 г раз в месяц. Мы подбираем зерно под ваш вкус, обжариваем в четверг и
            привозим по пятницам бесплатно.
          </p>
          <div className="subscription-price">
            <strong>54 BYN</strong>
            <span>/ месяц<br />доставка включена</span>
          </div>
          <button className="button button-light" onClick={() => goToForm("subscription")}>
            Оформить подписку <Arrow />
          </button>
        </div>
      </section>

      <section className="logistics section-shell" id="delivery" aria-labelledby="delivery-title">
        <div className="section-intro">
          <span className="section-number">03</span>
          <div>
            <p className="kicker">Забрать или дождаться курьера</p>
            <h2 id="delivery-title">Как получить кофе</h2>
          </div>
        </div>
        <div className="logistics-grid">
          <article>
            <span className="logistics-icon">↙</span>
            <p className="kicker">Самовывоз</p>
            <h3>Мастерская на Короля, 9</h3>
            <p>пн–пт 8:00–20:00<br />сб–вс 10:00–18:00</p>
            <a href="https://yandex.by/maps/?text=Минск%20Короля%209" target="_blank" rel="noreferrer">
              Открыть на карте <Arrow />
            </a>
          </article>
          <article>
            <span className="logistics-icon">→</span>
            <p className="kicker">Доставка</p>
            <h3>По Минску каждую пятницу</h3>
            <p>Бесплатно при заказе от 50 BYN.<br />В остальных случаях — 7 BYN.</p>
            <button onClick={() => goToForm("question")}>
              Уточнить район <Arrow />
            </button>
          </article>
        </div>
      </section>

      <section className="order-section section-shell" ref={formRef} id="order">
        <div className="order-copy">
          <h2>Оставьте заявку — остальное обсудим</h2>
          <p>
            Менеджер свяжется с вами в течение рабочего дня, уточнит помол, адрес и удобный
            способ оплаты.
          </p>
          <div className="contact-note">
            <span>или позвоните</span>
            <a href="tel:+375291234567">+375 29 123-45-67</a>
          </div>
        </div>
        
        {submitted ? (
          <div className="success-panel" role="status">
            <span className="success-mark">✓</span>
            <p className="kicker">Готово</p>
            <h2>Заявка принята!</h2>
            <p>Менеджер свяжется с вами в течение рабочего дня.</p>
            <button
              className="button button-dark"
              onClick={() => {
                setSubmitted(false);
                setSelectedProduct("");
                setPhone("");
              }}
            >
              Отправить еще одну
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <fieldset>
              <legend>Тип заявки</legend>
              <div className="segments">
                {[
                  ["once", "Разовый заказ"],
                  ["subscription", "Подписка"],
                  ["question", "Задать вопрос"],
                ].map(([value, label]) => (
                  <label key={value} className={requestType === value ? "active" : ""}>
                    <input
                      type="radio"
                      name="requestType"
                      value={value}
                      checked={requestType === value}
                      onChange={() => setRequestType(value as RequestType)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {selectedProduct && (
              <div className="selected-product">
                <span>Вы выбрали</span>
                <strong>{selectedProduct}</strong>
                <button type="button" onClick={() => setSelectedProduct("")} aria-label="Убрать товар">
                  ×
                </button>
              </div>
            )}
            <label className="field">
              <span>Имя</span>
              <input name="name" required placeholder="Как к вам обращаться?" />
            </label>
            <label className={`field ${phoneError ? "field-error" : ""}`}>
              <span>Номер телефона</span>
              <input
                name="phone"
                inputMode="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(formatPhone(event.target.value));
                  if (phoneError) setPhoneError("");
                }}
                required
                placeholder="+375 (XX) XXX-XX-XX"
                aria-describedby={phoneError ? "phone-error" : undefined}
              />
              {phoneError && <small id="phone-error">{phoneError}</small>}
            </label>
            <label className="field">
              <span>Комментарий или адрес</span>
              <textarea name="comment" rows={1} placeholder="Например: нужен помол под воронку" />
            </label>

            {/* Блок ошибки ответа сервера */}
            {serverError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  color: "#991b1b",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  marginBottom: "12px",
                  border: "1px solid #fecaca",
                }}
              >
                {serverError}
              </div>
            )}

            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"} <Arrow />
            </button>
            <p className="form-footnote">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
          </form>
        )}
      </section>

      <footer id="contacts">
        <div className="footer-top section-shell">
          <a className="logo footer-logo" href="#top">
            <BeanMark />
            <span>Кварта</span>
          </a>
          <p>Микрообжарка для тех,<br />кому важен вкус сегодня.</p>
          <div>
            <span>Мастерская</span>
            <p>Минск, ул. Короля, 9<br />пн–пт 8:00–20:00</p>
          </div>
          <div>
            <span>Контакты</span>
            <a href="tel:+375291234567">+375 29 123-45-67</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a>
          </div>
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 Кварта</span>
          <span>ИП Иванов Д. А. · УНП 193000000</span>
          <a href="#top">Наверх ↑</a>
        </div>
      </footer>
    </main>
  );
}
