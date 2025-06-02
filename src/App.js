import logo from './ive_icon.png';
import './App.css';
import { useEffect, useState, CSSProperties } from "react";
import cookie from 'react-cookies';
import { ClipLoader } from "react-spinners";
import axios from 'axios';

const override/*: CSSProperties*/ = {
  display: "block",
  margin: "0 auto",
  // borderColor: "red",
};

// New: Translation dictionary for Chinese and English
const translations = {
  zh: {
    welcome: "歡迎",
    parkingSpace: "{carNum}號車位",
    thereAreXInFront: "前面有",
    people: "個",
    youNeedToWait: "你要等",
    continue: "繼續",
    cheapestIndoorParking: "全香港最平嘅室內停車場",
    chargingTime: "充電時間:",
    minutes: "(分鐘)",
    totalPrice: "充電{chargingTime}分鐘，總費用為{price}元。",
    confirm: "確定",
    queuing: "排隊中",
    moving: "移動中",
    yourQueueNum: "你排第",
    timeToStartCharging: "距離開始充電時間還有",
    movingToSpot: "充電器行駛到閣下的車位需時",
    cancel: "取消",
    confirmCancel: "你確定要取消輪候充電?",
    yes: "是",
    no: "否",
    unplugMessage: "請拔除充電接收器，謝謝!",
    charging: "充電中",
    remainingTime: "閣下的充電時間剩餘",
    stop: "停止",
    confirmStop: "你確定要停止充電嗎?",
    chargingStopped: "充電已停止",
    thankYou: "感謝閣下使用，請拔除充電接收器，謝謝！",
    chargingFinished: "充電已完成",
    notYourSpot: "此車位已經有其他使用者使用!",
  },
  en: {
    welcome: "Welcome",
    parkingSpace: "Parking Space {carNum}",
    thereAreXInFront: "There are",
    people: "people ahead",
    youNeedToWait: "You need to wait",
    continue: "Continue",
    cheapestIndoorParking: "Hong Kong's Cheapest Indoor Parking",
    chargingTime: "Charging Time:",
    minutes: "(minutes)",
    totalPrice: "Charging for {chargingTime} minutes, total cost is ${price}.",
    confirm: "Confirm",
    queuing: "Queuing",
    moving: "Moving",
    yourQueueNum: "You are number",
    timeToStartCharging: "Time left to start charging",
    movingToSpot: "Time for charger to reach your parking space",
    cancel: "Cancel",
    confirmCancel: "Are you sure you want to cancel queuing for charging?",
    yes: "Yes",
    no: "No",
    unplugMessage: "Please unplug the charging receiver, thank you!",
    charging: "Charging",
    remainingTime: "Remaining charging time",
    stop: "Stop",
    confirmStop: "Are you sure you want to stop charging?",
    chargingStopped: "Charging has stopped",
    thankYou: "Thank you for using our service, please unplug the charging receiver!",
    chargingFinished: "Charging completed",
    notYourSpot: "This parking space is already in use by another user!",
  },
};

function App() {
  // New: State for current language
  const [language, setLanguage] = useState('zh'); // Default to Chinese
  let time_lang='zh';
  // New: Function to toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
    time_lang=language;
  };

  // Existing code unchanged until noted
  function nomal(element) {
    return document.createElement(element);
  }
  const minlim = 15;
  const maxlim = 120;
  const time_step = 15;
  var display_time = 15;
  const FirstTime = 0;
  const InQueue = 1;
  const InUse = 2;
  const Finish = 3;
  const not_this_user = 4;
  let [carNum, setcarNum] = useState("");

  let interval;

  const API_BASE_URL = 'https://carparkvercelbackend.vercel.app';
  const backend = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
  });

  async function getMongo_userState(_carNum) {
    console.log("_carNum" + _carNum);
    try {
      let output = [];
      const carNum_response = await backend.get("/", {
        params: {
          'Parking Space Num': _carNum,
          _id: `"${cookie.load("_id")}"`
        }
      });
      console.log(carNum_response);
      console.log(carNum_response.data);
      return carNum_response.data;
    } catch (error) {
      console.error('Error fetching data: ', error);
      throw error;
    }
  }

  function millis_to_time_String(durationInMillis) {
    let millis = durationInMillis % 1000;
    let second = (durationInMillis / 1000) % 60;
    let minute = (durationInMillis / (1000 * 60));
    // Modified: Use translation for time format
    let time = time_lang === 'zh'
      ? `${Math.floor(minute)}分鐘 ${Math.floor(second)}秒`
      : `${Math.floor(minute)} min ${Math.floor(second)} sec`;
    return time;
  }
  let useEffect_lock = false;
  let eventSource = void 0;
  let eventMTloop = void 0;
  let dont_reload = false;
  let last_useEffect = 0;

  function after_useEffect() {
    if (useEffect_lock) {
      function eventMT() {
        console.log(millis_to_time_String(Date.now() - last_useEffect));
        if (cookie.load("_id") === void 0 && Date.now() - last_useEffect < 1500) return;
        else clearInterval(eventMTloop);
        eventSource = new EventSource(`${API_BASE_URL}/events?_id="${cookie.load("_id")}"`);
        console.log("eventSource", eventSource);
        eventSource.onmessage = (event) => {
          const data = (event.data);
          console.log('接收到事件:', event.type);
          console.log('接收到事件數據:', data);
          console.log("exception:", data.exception);
          if ((
            (document.getElementById("SelectChargingTime")
              && document.getElementById("SelectChargingTime").style.display == "none")
            || (document.getElementById("confirmBtn")
              && document.getElementById("confirmBtn").style.display == "none")
          )
            &&
            document.getElementById("ExistingUsing_stop_btn")
            && document.getElementById('ExistingUsing_stop_btn').style.display == ''
            &&
            document.getElementById("cancelbtn")
            && document.getElementById("cancelbtn").style.display == ""
          ) {
            console.log(event.data);
            console.log(event.data == "reload");
            console.log(event.data == "fetchData");
            if (event.data == "reload") {
              console.log("reload");
              redirectToNextPage();
            }
            if (event.data == "fetchData") {
              console.log("fetchData");
              fetchData();
            }
          } else
            console.log(
              `don't reload
            ${document.getElementById("SelectChargingTime")}
            &&${document.getElementById("SelectChargingTime").style.display == "none"}
            &&
            ${document.getElementById("ExistingUsing_stop_btn")}
            &&${document.getElementById('ExistingUsing_stop_btn').style.display == ''}
            &&
            ${document.getElementById("cancelbtn")}
            &&${document.getElementById("cancelbtn").style.display == ""}
              `
            );
        };
      }
      eventMTloop = setInterval(eventMT, 500);
      last_useEffect = Date.now();
      window.onbeforeunload = function () {
        if (
          document.getElementById("welcome")
          && document.getElementById("welcome").style.display != "none"
        );
      };
      return;
    }
  }

  let fetchData = void 0;
  useEffect(() => {
    if (useEffect_lock) return;
    useEffect_lock = true; console.log(useEffect_lock);
    console.log("useEffect");
    document.getElementById("loading繼續").style.height = document.getElementById("after_cookie").style.height;
    console.log(document.getElementById("after_cookie").style);
    for (let i = 1; i < 12; i++) console.log(window.location.host + "/" + btoa(i));
    console.log(window.location.pathname);
    const carNum_base64 = window.location.pathname.substring(1);
    console.log(carNum_base64);
    setcarNum(atob(carNum_base64));
    // Modified: Update document title with translated parking space
    document.title = translations[language].parkingSpace.replace('{carNum}', atob(carNum_base64));
    const react_def_app = document.getElementById("react_def_app");
    react_def_app.style.display = "none";
    const SelectChargingTime = document.getElementById("SelectChargingTime");
    SelectChargingTime.style.display = "none";
    let queue_endtime = undefined;
    let charge_endtime = undefined;
    fetchData = () => {
      console.log("atob(carNum_base64)=" + atob(carNum_base64));
      getMongo_userState(atob(carNum_base64))
        .then(async (params) => {
          setcarNum(params[3]);
          const user_State = params[0];
          console.log(user_State);
          console.log(params);
          const SelectChargingTime = document.getElementById("SelectChargingTime");
          SelectChargingTime.style.display = "none";
          if (user_State != FirstTime) {
            console.log("user_State != FirstTime");
            const welcome = document.getElementById("welcome");
            welcome.style.display = "none";
          } else {
            const welcome = document.getElementById("welcome");
            welcome.style.display = "";
            console.log("FirstTime");
            console.log(params);
            console.log(params[0]);
            console.log(params[1]);
            console.log(params[2]);
            document.getElementById("There are x in front").innerHTML = params[1] - 1;
            const time = (params[2] - new Date(Date.now()).getTime());
            console.log(`(${params[2]} - ${new Date(Date.now()).getTime()})`);
            document.getElementById("You need to wait x minutes").innerHTML = millis_to_time_String(time < 0 ? 0 : time);
            queue_endtime = (params[2]);
            console.log(cookie.load("_id"));
            console.log(cookie.load("_id") === undefined);
            if (cookie.load("_id") === undefined) {
              const carNum_base64 = window.location.pathname.substring(1);
              const response = await backend.post("/register", null,
                {
                  params: {
                    'Parking Space Num': atob(carNum_base64),
                  }
                }
              );
              console.log(response);
              const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
              console.log(expires);
              console.log(window.location.host);
              cookie.save(
                '_id',
                response.data,
                {
                  path: '/',
                  expires,
                });
              console.log(cookie.load("_id"));
            }
          }
          if (user_State != InQueue) {
            console.log("user_State != InQueue");
            const Queuing = document.getElementById("Queuing");
            Queuing.style.display = "none";
          } else {
            const Queuing = document.getElementById("Queuing");
            Queuing.style.display = "";
            console.log("InQueue");
            document.getElementById("You are in ranking X").innerHTML = params[1];
            const time = (params[2] - new Date(Date.now()).getTime());
            if (params[1] == 1 && params[4] && Date.now() < params[4]) {
              const moveing_time = (params[4] - new Date(Date.now()).getTime());
              document.getElementById("There are x minutes left to start charging").innerHTML = millis_to_time_String(moveing_time < 0 ? 0 : moveing_time);
              queue_endtime = (params[4]);
              document.getElementById("InQueue_state_text").innerHTML = translations[language].moving;
              document.getElementById("your_queue_num_text").style.display = "none";
              document.getElementById("You are in ranking X").style.display = "none";
              document.getElementById("waitting_time_has").style.display = "none";
              document.getElementById("Remaining time moving to").style.display = "";
            } else {
              document.getElementById("There are x minutes left to start charging").innerHTML = millis_to_time_String(time < 0 ? 0 : time);
              queue_endtime = (params[2]);
            }
          }
          if (user_State != InUse) {
            console.log("user_State != InUse");
            const ExistingUsing = document.getElementById("ExistingUsing");
            ExistingUsing.style.display = "none";
          } else {
            const ExistingUsing = document.getElementById("ExistingUsing");
            ExistingUsing.style.display = "";
            console.log("InUse");
            console.log(params);
            charge_endtime = (params[1]);
            document.getElementById("Remaining time").innerHTML = millis_to_time_String(charge_endtime - new Date(Date.now()).getTime());
          }
          if (user_State != Finish) {
            console.log("user_State != Finish");
            const FinishCharging = document.getElementById("FinishCharging");
            FinishCharging.style.display = "none";
          } else {
            const FinishCharging = document.getElementById("FinishCharging");
            FinishCharging.style.display = "";
            console.log("Finish");
            cookie.remove("_id");
          }
          if (user_State != not_this_user) {
            console.log(not_this_user);
            const NotYou = document.getElementById("NotYou");
            NotYou.style.display = "none";
          } else {
            const NotYou = document.getElementById("NotYou");
            NotYou.style.display = "";
          }

          document.getElementById("_id").innerHTML = cookie.load("_id") || "no _id";
          document.getElementById("loading繼續").style.display = "none";
          document.getElementById("after_cookie").style.display = "";
        });
    };

    fetchData();

    let countdown_loop = () => { console.warn("empty countdown_loop"); };
    interval = setInterval(countdown_loop, 0);
    clearInterval(interval);
    let fetched = false;
    countdown_loop = () => {
      if (charge_endtime && charge_endtime > 0) {
        const newTime = charge_endtime - new Date(Date.now()).getTime();
        if (newTime <= 0) {
          // redirectToNextPage()
        }
        if (document.getElementById("Remaining time")) {
          document.getElementById("Remaining time").innerHTML = millis_to_time_String(newTime < 0 ? 0 : newTime);
        }
      }
      const newTime = queue_endtime - new Date(Date.now()).getTime();
      if (document.getElementById("There are x minutes left to start charging")) {
        if (newTime && newTime > 0)
          document.getElementById("There are x minutes left to start charging").innerHTML = millis_to_time_String(newTime);
        else document.getElementById("There are x minutes left to start charging").innerHTML = millis_to_time_String(0);
      }
      if (document.getElementById("You need to wait x minutes")) {
        if (newTime && newTime > 0)
          document.getElementById("You need to wait x minutes").innerHTML = millis_to_time_String(newTime);
        else document.getElementById("You need to wait x minutes").innerHTML = millis_to_time_String(0);
      }
      if (newTime && newTime < 0 && cookie.load("_id")) {
        if ((
          (document.getElementById("SelectChargingTime")
            && document.getElementById("SelectChargingTime").style.display == "none")
          || (document.getElementById("confirmBtn")
            && document.getElementById("confirmBtn").style.display == "none")
        )
          &&
          document.getElementById("ExistingUsing_stop_btn")
          && document.getElementById('ExistingUsing_stop_btn').style.display == ''
          &&
          document.getElementById("cancelbtn")
          && document.getElementById("cancelbtn").style.display == ""
        ) {
          if (!fetched) {
            console.log("fetchData");
            fetchData();
          }
          fetched = true;
        } else
          console.log(
            `don't fetchData
            ${document.getElementById("SelectChargingTime")}
            &&${document.getElementById("SelectChargingTime").style.display == "none"}
            &&
            ${document.getElementById("ExistingUsing_stop_btn")}
            &&${document.getElementById('ExistingUsing_stop_btn').style.display == ''}
            &&
            ${document.getElementById("cancelbtn")}
            &&${document.getElementById("cancelbtn").style.display == ""}
              `
          );
        }
        console.log("interval");
    };
    interval = setInterval(countdown_loop, 1000);
    document.getElementById("confirmText").style.display = "none";
    document.getElementById("confirmButtons").style.display = "none";
    document.getElementById("chargingStopped").style.display = "none";
    document.getElementById("thankYouMsg").style.display = "none";
    document.getElementById("chargingStopped").style.color = "white";
    document.getElementById("thankYouMsg").style.color = "white";

    updateTotalPrice();
    after_useEffect();
    return () => {
      try { if (eventSource !== void 0) eventSource.close(); }
      catch { };
    };
  }, []);

  function goto(v) {
    return (a) => {
      console.log(a);
      for (let i = 0; i < arguments.length; i++) {
        v = arguments[i];
        console.log(v);
        const target = document.getElementById(v);
        if (target != null) target.style.display = '';
        else {
          document.getElementById("react_def_app").style.display = '';
          return;
        }
      }
      let crr = a.currentTarget;
      console.log(crr);
      console.log(crr.parentNode);
      let count = 0;
      while (crr.tagName.indexOf("TOP") < 0) {
        if (crr.parentNode != null)
          crr = crr.parentNode;
        else break;
        count++;
      }
      console.log(count);
      console.log(crr);
      crr.style.display = "none";
    };
  }

  const updateTotalPrice = () => {
    const totalPrice = document.getElementById('total-price');
    const chargingTimeSelect = document.getElementById('charging-time');
    const chargingTime = parseInt(chargingTimeSelect.innerHTML);
    const price = chargingTime / 15 * 5;
    // Modified: Use translated total price text
    totalPrice.textContent = translations[language].totalPrice
      .replace('{chargingTime}', chargingTime)
      .replace('{price}', price);
  };

  function increasetimeBtn(e) {
    console.log("add_time");
    console.log(display_time);
    if (display_time < maxlim)
      display_time += 15;
    console.log(display_time);
    const chargingTimeSelect = document.getElementById('charging-time');
    console.log(chargingTimeSelect);
    chargingTimeSelect.innerHTML = display_time;
    updateTotalPrice();
  }

  function decreasetimeBtn(e) {
    console.log("sub_time");
    if (display_time > minlim)
      display_time -= 15;
    const chargingTimeSelect = document.getElementById('charging-time');
    chargingTimeSelect.innerHTML = display_time;
    updateTotalPrice();
  }

  async function confirmPayment() {
    document.getElementById("confirmBtn").style.display = "none";
    const carNum_base64 = window.location.pathname.substring(1);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
    console.log(expires);
    console.log(window.location.host);
    cookie.save(
      '_id',
      cookie.load("_id"),
      {
        path: '/',
        expires,
      });
    const response = await backend.post("/selected", null,
      {
        params: {
          '_id': cookie.load('_id'),
          'Parking Space Num': atob(carNum_base64),
          'charge duration': document.getElementById("charging-time").innerHTML,
        }
      }
    );
    console.log(response);
  }

  function redirectToNextPage() {
    console.log(`/${btoa(atob(window.location.pathname.substring(1)))}`);
    console.log(window.location.pathname.substring(1));
    window.location.href = `/${btoa(atob(window.location.pathname.substring(1)))}`;
  }

  function showMessage(isConfirmed) {
    return async () => {
      const cancel_show = document.getElementById("cancel_show");
      const infoRow = document.getElementById("infoRow");
      if (isConfirmed) {
        infoRow.style.display = "none";
        const cancal_response = await backend.post("/cancal", null, {
          params: {
            "_id": cookie.load('_id')
          }
        });
        console.log(cancal_response);
        cookie.remove('_id');
        document.getElementById('message').textContent = translations[language].unplugMessage;
      }
      else {
        const cancelbtn = document.getElementById("cancelbtn");
        const samplebtn = document.getElementById("samplebtn");
        cancelbtn.style = samplebtn.style;
      }
      cancel_show.style.display = "none";
      document.getElementById('message').style.display = '';
    };
  }

  function cancel() {
    return () => {
      const cancel_show = document.getElementById("cancel_show");
      const cancelbtn = document.getElementById("cancelbtn");
      cancel_show.style.display = "";
      cancelbtn.style.display = "none";
    };
  }

  function confirmStop() {
    return () => {
      document.getElementById('confirmText').style.display = '';
      document.getElementById('confirmButtons').style.display = '';
      document.getElementById('ExistingUsing_stop_btn').style.display = 'none';
      document.getElementById('chargingTime').style.display = 'none';
    };
  }

  function stopCharging() {
    return async () => {
      document.getElementById('confirmText').style.display = 'none';
      document.getElementById('confirmButtons').style.display = 'none';
      const cancal_response = await backend.post("/cancal", null, {
        params: {
          "_id": cookie.load('_id')
        }
      });
      console.log(cancal_response);
      cookie.remove("_id");
      document.getElementById('chargingStopped').style.display = '';
      document.getElementById('thankYouMsg').style.display = '';
    };
  }

  function cancelStop() {
    return () => {
      document.getElementById('confirmText').style.display = 'none';
      document.getElementById('confirmButtons').style.display = 'none';
      document.getElementById('ExistingUsing_stop_btn').style.display = '';
      document.getElementById('chargingTime').style.display = '';
    };
  }

  // Modified: JSX with translated text and language toggle button
  return (
    <div className="App">
      <header className="App-header">
        {/* New: Language toggle button */}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <button onClick={toggleLanguage}>
            {language === 'zh' ? 'Switch to English' : '切換到中文'}
          </button>
        </div>
        <p id="_id" style={{ display: "none" }}>loading</p>
        <div-top id="react_def_app" style={{ display: "none" }}>
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </div-top>
        <div-top id="welcome" style={{ display: "none" }}>
          <h1>{translations[language].welcome}</h1>
          <div class="info">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          <div>
            <table class="center">
              <tbody>
                <tr>
                  <td>{translations[language].thereAreXInFront}</td>
                  <td><p id="There are x in front">X</p></td>
                  <td>{translations[language].people}</td>
                  <td style={{ padding: 10 + "px" }}></td>
                  <td>{translations[language].youNeedToWait}</td>
                  <td><p id="You need to wait x minutes">X</p></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <button id="after_cookie" onClick={goto("SelectChargingTime")} style={{ display: "none" }}>
              {translations[language].continue}
            </button>
            <div id="loading繼續">
              <ClipLoader
                color="#ff00ba"
                loading={true}
                cssOverride={override}
                size={64}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          </div>
        </div-top>
        <div-top id="SelectChargingTime" style={{ display: "none" }}>
          <h1>{translations[language].cheapestIndoorParking}</h1>
          <div id="parking-spots">
            <div class="parking-spot" data-spot="X">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          </div>
          <div id="charging-options">
            <table class="center">
              <tbody>
                <tr>
                  <td>{translations[language].chargingTime}</td>
                  <td><p id="charging-time">15</p></td>
                  <td>{translations[language].minutes}</td>
                </tr>
              </tbody>
            </table>
            <button style={{ marginRight: 50 + 'px' }} class="sym" onClick={decreasetimeBtn}>-</button>
            <button style={{ marginLeft: 50 + 'px' }} class="sym" onClick={increasetimeBtn}>+</button>
            <p></p>
            <p id="total-price"></p>
            <button id="confirmBtn" onClick={confirmPayment}>{translations[language].confirm}</button>
          </div>
        </div-top>
        <div-top id="Queuing" style={{ display: "none" }}>
          <h1>{translations[language].cheapestIndoorParking}</h1>
          <div class="info">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          <table class="center">
            <tr>
              <td id="InQueue_state_text" colspan="6">{translations[language].queuing}</td>
            </tr>
            <tr id="infoRow">
              <td id="your_queue_num_text">{translations[language].yourQueueNum}</td>
              <td><p id="You are in ranking X">X</p></td>
              <td style={{ padding: 10 + "px" }}></td>
              <td id="waitting_time_has">{translations[language].timeToStartCharging}</td>
              <td id="Remaining time moving to" style={{ display: "none" }}>{translations[language].movingToSpot}</td>
              <td><p id="There are x minutes left to start charging">X</p></td>
            </tr>
          </table>
          <button id="cancelbtn" onClick={cancel()}>{translations[language].cancel}</button>
          <div id="cancel_show" style={{ display: "none" }}>
            <p>{translations[language].confirmCancel}</p>
            <button onClick={showMessage(true)}>{translations[language].yes}</button>
            <button onClick={showMessage(false)} id="samplebtn">{translations[language].no}</button>
          </div>
          <p id="message" style={{ display: "none" }}></p>
        </div-top>
        <div-top id="ExistingUsing" style={{ display: "none" }}>
          <h1>{translations[language].cheapestIndoorParking}</h1>
          <div class="info">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          <table id="chargingTime" class="center">
            <tr>
              <td colspan="2">{translations[language].charging}</td>
            </tr>
            <tr>
              <td>{translations[language].remainingTime}</td>
              <td><p id="Remaining time">X</p></td>
            </tr>
          </table>
          <button id="ExistingUsing_stop_btn" onClick={confirmStop()} class="btn">{translations[language].stop}</button>
          <p id="confirmText" style={{ display: "none" }}>{translations[language].confirmStop}</p>
          <div id="confirmButtons" style={{ display: "none" }}>
            <button class="yesBtn" onClick={stopCharging()}>{translations[language].yes}</button>
            <button class="noBtn" onClick={cancelStop()}>{translations[language].no}</button>
          </div>
          <p id="chargingStopped" style={{ display: "none" }}>{translations[language].chargingStopped}</p>
          <p id="thankYouMsg" style={{ display: "none" }}>{translations[language].thankYou}</p>
        </div-top>
        <div-top id="FinishCharging" style={{ display: "none" }}>
          <h1>{translations[language].cheapestIndoorParking}</h1>
          <div class="info">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          <p>{translations[language].chargingFinished}</p>
          <p>{translations[language].thankYou}</p>
        </div-top>
        <div-top id="NotYou" style={{ display: "none" }}>
          <h1>{translations[language].cheapestIndoorParking}</h1>
          <div class="info">{translations[language].parkingSpace.replace('{carNum}', carNum)}</div>
          <p>{translations[language].notYourSpot}</p>
        </div-top>
      </header>
    </div>
  );
}

export default App;
