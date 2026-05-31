import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import QRCode from 'qrcode';

import {
  login,
  verify2fa,
  loginByRecoveryCode,
} from '../../redux/slices/authSlice';

import styles from './style.module.css';
import { hostName } from '../../utils/host';

// ─── Phone mask ───────────────────────────────────────────────────────────────
// Separator coloring: each sep is dark only when its neighbouring digit exists.
// '(' dark when digits[0] present; ') ' dark when digits[2] present, etc.
const MASK = [
  { t:'sep', ch:'(',  thr:0 },
  { t:'d', i:0 }, { t:'d', i:1 }, { t:'d', i:2 },
  { t:'sep', ch:') ', thr:2 },
  { t:'d', i:3 }, { t:'d', i:4 }, { t:'d', i:5 },
  { t:'sep', ch:'-',  thr:5 },
  { t:'d', i:6 }, { t:'d', i:7 },
  { t:'sep', ch:'-',  thr:7 },
  { t:'d', i:8 }, { t:'d', i:9 },
];

// Returns array of { char, dark } for rendering
const buildChars = (digits) =>
  MASK.map((m) => {
    if (m.t === 'sep') return { char: m.ch, dark: digits.length > m.thr };
    const has = m.i < digits.length;
    return { char: has ? digits[m.i] : '0', dark: has };
  });

const buildServerPhone = (digits) => '8' + digits;

// ─── Icons ───────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Stages ──────────────────────────────────────────────────────────────────
const STAGE = { CREDENTIALS: 'credentials', QR: 'qr', OTP: 'otp', RECOVERY: 'recovery' };

// ─── Component ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const dispatch    = useDispatch();
  const [stage, setStage] = useState(STAGE.CREDENTIALS);

  // credentials
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [credError, setCredError]     = useState(false);
  const [shakeKey, setShakeKey]       = useState(0);
  const phoneInputRef                 = useRef(null);

  // 2FA
  const [tempToken, setTempToken] = useState(null);
  const [qrUri, setQrUri]         = useState(null);
  const qrCanvasRef               = useRef(null);

  // OTP
  const [otpDigits, setOtpDigits]     = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError]       = useState(false);
  const [otpShakeKey, setOtpShakeKey] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Recovery
  const [recoveryCode, setRecoveryCode]         = useState('');
  const [recoveryError, setRecoveryError]       = useState(false);
  const [recoveryShakeKey, setRecoveryShakeKey] = useState(0);

  const [loading, setLoading] = useState(false);

  const triggerShake = useCallback((setter) => setter((k) => k + 1), []);

  useEffect(() => {
    if (qrUri && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, qrUri, {
        width: 192, margin: 1,
        color: { dark: '#1a1523', light: '#ffffff' },
      }, (err) => { if (err) console.error('QR error', err); });
    }
  }, [qrUri, stage]);

  // ── Phone handlers ────────────────────────────────────────────────────────
  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') { e.preventDefault(); setPhoneDigits((d) => d.slice(0, -1)); }
    if (e.key === 'Delete')    { e.preventDefault(); setPhoneDigits(''); }
    // digits 0-9
    if (/^\d$/.test(e.key) && phoneDigits.length < 10) {
      e.preventDefault();
      setPhoneDigits((d) => d + e.key);
    }
  };

  // paste support
  const handlePhonePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);
  };

  // focus always puts cursor at end (invisible, but avoids the "all selected" flash)
  const handlePhoneFocus = () => {
    setTimeout(() => {
      const inp = phoneInputRef.current;
      if (inp) inp.selectionStart = inp.selectionEnd = inp.value.length;
    }, 0);
  };

  // ── Credential submit ─────────────────────────────────────────────────────
  const handleCredentialsSubmit = async () => {
    setCredError(false);
    if (phoneDigits.length < 10 || !password) {
      setCredError(true); triggerShake(setShakeKey); return;
    }
    setLoading(true);
    const result = await dispatch(login({
      phone: buildServerPhone(phoneDigits),
      password,
      url: `${hostName}/auth/login`,
    }));
    setLoading(false);
    if (login.fulfilled.match(result)) {
      const { temp_token, qr_uri } = result.payload;
      setTempToken(temp_token);
      if (qr_uri) { setQrUri(qr_uri); setStage(STAGE.QR); }
      else { setStage(STAGE.OTP); }
    } else {
      setCredError(true); triggerShake(setShakeKey);
    }
  };

  // ── OTP handlers ──────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next  = [...otpDigits]; next[index] = digit; setOtpDigits(next);
    if (digit && index < 5) otpRefs[index + 1].current?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
      otpRefs[index - 1].current?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['','','','','',''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };
  const handleOtpSubmit = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) { setOtpError(true); triggerShake(setOtpShakeKey); return; }
    setOtpError(false); setLoading(true);
    const result = await dispatch(verify2fa({ code, tempToken, url: `${hostName}/auth/verify_2fa` }));
    setLoading(false);
    if (verify2fa.rejected.match(result)) {
      setOtpError(true); triggerShake(setOtpShakeKey);
      setOtpDigits(['','','','','','']); otpRefs[0].current?.focus();
    }
  };

  // ── Recovery submit ───────────────────────────────────────────────────────
  const handleRecoverySubmit = async () => {
    if (!recoveryCode.trim()) { setRecoveryError(true); triggerShake(setRecoveryShakeKey); return; }
    setRecoveryError(false); setLoading(true);
    const result = await dispatch(loginByRecoveryCode({
      recoveryCode: recoveryCode.trim(), tempToken,
      url: `${hostName}/auth/login_by_recovery_code`,
    }));
    setLoading(false);
    if (loginByRecoveryCode.rejected.match(result)) { setRecoveryError(true); triggerShake(setRecoveryShakeKey); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className={styles.loginSection}>

      {/* ── CREDENTIALS ── */}
      {stage === STAGE.CREDENTIALS && (
        <form
          className={styles.formMain}
          onSubmit={(e) => { e.preventDefault(); handleCredentialsSubmit(); }}
        >
          <p className={styles.formTitle}>Вход</p>
          <p className={styles.formSubtitle}>Введите номер телефона и пароль</p>

          <div
            key={shakeKey}
            className={[
              styles.inputGroup,
              credError ? styles.inputGroupError : '',
              credError ? styles.shake : '',
            ].join(' ')}
          >
              {/* ── Phone row ── */}
              <div className={styles.inputRow}>
                {/* phoneRow: +7 prefix + mask chars + invisible input all in one flat flex row */}
                <div
                  className={styles.phoneRow}
                  onClick={() => phoneInputRef.current?.focus()}
                >
                  <span className={styles.phonePrefix}>+7</span>

                  <div className={styles.phoneDisplay}>
                    {buildChars(phoneDigits).map(({ char, dark }, idx) => (
                      <span
                        key={idx}
                        className={dark ? styles.phoneCharTyped : styles.phoneCharPlaceholder}
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {/* invisible input stretched over entire phoneRow */}
                  <input
                    ref={phoneInputRef}
                    className={styles.phoneHiddenInput}
                    type="text"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phoneDigits}
                    readOnly
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={handlePhonePaste}
                    onFocus={handlePhoneFocus}
                    aria-label="Номер телефона"
                  />
                </div>
              </div>

            {/* ── Password row ── */}
            <div className={styles.inputRow}>
              <input
                className={styles.visibleInput}
                type={showPass ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>

          {credError && (
            <p className={styles.errorMessage}>Неверный номер телефона или пароль</p>
          )}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? 'Подождите…' : 'Войти'}
          </button>
        </form>
      )}

      {/* ── QR ── */}
      {stage === STAGE.QR && (
        <div className={styles.formMain}>
          <p className={styles.formTitle}>Двухфакторная аутентификация</p>
          <p className={styles.formSubtitle}>
            Отсканируйте QR-код в приложении-аутентификаторе
            (Google Authenticator, Яндекс Ключ и&nbsp;др.)
          </p>
          <div className={styles.qrWrapper}>
            <canvas ref={qrCanvasRef} className={styles.qrCanvas} />
          </div>
          <button className={styles.submitButton} onClick={() => setStage(STAGE.OTP)}>
            Я отсканировал QR-код
          </button>
        </div>
      )}

      {/* ── OTP ── */}
      {stage === STAGE.OTP && (
        <form
          className={styles.formMain}
          onSubmit={(e) => { e.preventDefault(); handleOtpSubmit(); }}
        >
          <p className={styles.formTitle}>Код подтверждения</p>
          <p className={styles.formSubtitle}>Введите 6-значный код из приложения-аутентификатора</p>

          <div
            key={otpShakeKey}
            className={[styles.otpContainer, otpError ? styles.shake : ''].join(' ')}
            onPaste={handleOtpPaste}
          >
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                className={[styles.otpInput, otpError ? styles.otpError : ''].join(' ')}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
              />
            ))}
          </div>

          {otpError && (
            <p className={styles.errorMessage}>Неверный код. Попробуйте ещё раз</p>
          )}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Подтвердить'}
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => { setOtpError(false); setStage(STAGE.RECOVERY); }}
          >
            Проблемы с аутентификатором?
          </button>
        </form>
      )}

      {/* ── RECOVERY ── */}
      {stage === STAGE.RECOVERY && (
        <form
          className={styles.formMain}
          onSubmit={(e) => { e.preventDefault(); handleRecoverySubmit(); }}
        >
          <p className={styles.formTitle}>Код восстановления</p>
          <p className={styles.formSubtitle}>
            Введите резервный код, сохранённый при настройке аккаунта
          </p>

          <div key={recoveryShakeKey} className={recoveryError ? styles.shake : ''}>
            <input
              className={[styles.recoveryInput, recoveryError ? styles.inputError : ''].join(' ')}
              type="text"
              placeholder="xxxx-xxxx-xxxx"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
            />
          </div>

          {recoveryError && (
            <p className={styles.errorMessage}>Неверный код восстановления</p>
          )}

          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? 'Проверка…' : 'Войти'}
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => { setRecoveryError(false); setStage(STAGE.OTP); }}
          >
            Вернуться к коду из приложения
          </button>
        </form>
      )}
    </section>
  );
};

export default LoginPage;
