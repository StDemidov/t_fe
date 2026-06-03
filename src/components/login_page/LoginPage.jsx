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
// Single real <input> whose value IS the formatted string.
// We store only raw digits (up to 10) and format them into "(NNN) NNN-NN-NN".
// The cursor is always pinned to the end of the last real digit.

/** Format up to 10 digits → "(916) 666-94-45" style */
const formatPhone = (digits) => {
  const d = digits;
  let out = '';
  if (d.length === 0) return '';
  out += '(' + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
};

/** Cursor position in the formatted string after the last digit */
const cursorPos = (digits) => formatPhone(digits).length;

const buildServerPhone = (digits) => '8' + digits;

// ─── Icons ───────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ─── Stages ──────────────────────────────────────────────────────────────────
const STAGE = {
  CREDENTIALS: 'credentials',
  QR: 'qr',
  OTP: 'otp',
  RECOVERY: 'recovery',
};

// ─── Component ───────────────────────────────────────────────────────────────
const LoginPage = () => {
  const dispatch = useDispatch();
  const [stage, setStage] = useState(STAGE.CREDENTIALS);

  // credentials
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [credError, setCredError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const phoneInputRef = useRef(null);

  // 2FA
  const [tempToken, setTempToken] = useState(null);
  const [qrUri, setQrUri] = useState(null);
  const qrCanvasRef = useRef(null);

  // OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [otpShakeKey, setOtpShakeKey] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Recovery
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);
  const [recoveryShakeKey, setRecoveryShakeKey] = useState(0);

  const [loading, setLoading] = useState(false);

  const triggerShake = useCallback((setter) => setter((k) => k + 1), []);

  useEffect(() => {
    if (qrUri && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        qrUri,
        {
          width: 192,
          margin: 1,
          color: { dark: '#1a1523', light: '#ffffff' },
        },
        (err) => {
          if (err) console.error('QR error', err);
        }
      );
    }
  }, [qrUri, stage]);

  // ── Phone handlers ────────────────────────────────────────────────────────
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const stripped =
      raw.startsWith('7') || raw.startsWith('8') ? raw.slice(1) : raw;
    const next = stripped.slice(0, 10);
    setPhoneDigits(next);
    // Pin cursor to end of last real digit immediately after state update
    requestAnimationFrame(() => {
      const inp = phoneInputRef.current;
      if (!inp) return;
      const pos = cursorPos(next);
      inp.setSelectionRange(pos, pos);
    });
  };

  // ── Credential submit ─────────────────────────────────────────────────────
  const handleCredentialsSubmit = async () => {
    setCredError(false);
    if (phoneDigits.length < 10 || !password) {
      setCredError(true);
      triggerShake(setShakeKey);
      return;
    }
    setLoading(true);
    const result = await dispatch(
      login({
        phone: buildServerPhone(phoneDigits),
        password,
        url: `${hostName}/auth/login`,
      })
    );
    setLoading(false);
    if (login.fulfilled.match(result)) {
      const { temp_token, qr_uri } = result.payload;
      setTempToken(temp_token);
      if (qr_uri) {
        setQrUri(qr_uri);
        setStage(STAGE.QR);
      } else {
        setStage(STAGE.OTP);
      }
    } else {
      setCredError(true);
      triggerShake(setShakeKey);
    }
  };

  // ── OTP handlers ──────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs[index + 1].current?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
      otpRefs[index - 1].current?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    setOtpDigits(next);
    otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };
  const handleOtpSubmit = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError(true);
      triggerShake(setOtpShakeKey);
      return;
    }
    setOtpError(false);
    setLoading(true);
    const result = await dispatch(
      verify2fa({ code, tempToken, url: `${hostName}/auth/verify_2fa` })
    );
    setLoading(false);
    if (verify2fa.rejected.match(result)) {
      setOtpError(true);
      triggerShake(setOtpShakeKey);
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    }
  };

  // ── Recovery submit ───────────────────────────────────────────────────────
  const handleRecoverySubmit = async () => {
    if (!recoveryCode.trim()) {
      setRecoveryError(true);
      triggerShake(setRecoveryShakeKey);
      return;
    }
    setRecoveryError(false);
    setLoading(true);
    const result = await dispatch(
      loginByRecoveryCode({
        recoveryCode: recoveryCode.trim(),
        tempToken,
        url: `${hostName}/auth/login_by_recovery_code`,
      })
    );
    setLoading(false);
    if (loginByRecoveryCode.rejected.match(result)) {
      setRecoveryError(true);
      triggerShake(setRecoveryShakeKey);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className={styles.loginSection}>
      {/* ── CREDENTIALS ── */}
      {stage === STAGE.CREDENTIALS && (
        <form
          className={styles.formMain}
          onSubmit={(e) => {
            e.preventDefault();
            handleCredentialsSubmit();
          }}
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
              <span className={styles.phonePrefix}>+7</span>
              <input
                ref={phoneInputRef}
                className={styles.phoneInput}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="(000) 000-00-00"
                value={formatPhone(phoneDigits)}
                onChange={handlePhoneChange}
                onFocus={(e) => {
                  const pos = cursorPos(phoneDigits);
                  requestAnimationFrame(() =>
                    e.target.setSelectionRange(pos, pos)
                  );
                }}
                onClick={(e) => {
                  const pos = cursorPos(phoneDigits);
                  requestAnimationFrame(() =>
                    e.target.setSelectionRange(pos, pos)
                  );
                }}
                aria-label="Номер телефона"
              />
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
            <p className={styles.errorMessage}>
              Неверный номер телефона или пароль
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Подождите…' : 'Войти'}
          </button>
        </form>
      )}

      {/* ── QR ── */}
      {stage === STAGE.QR && (
        <div className={styles.formMain}>
          <p className={styles.formTitle}>Двухфакторная аутентификация</p>
          <p className={styles.formSubtitle}>
            Отсканируйте QR-код в приложении-аутентификаторе (Google
            Authenticator, Яндекс Ключ и&nbsp;др.)
          </p>
          <div className={styles.qrWrapper}>
            <canvas ref={qrCanvasRef} className={styles.qrCanvas} />
          </div>
          <button
            className={styles.submitButton}
            onClick={() => setStage(STAGE.OTP)}
          >
            Я отсканировал QR-код
          </button>
        </div>
      )}

      {/* ── OTP ── */}
      {stage === STAGE.OTP && (
        <form
          className={styles.formMain}
          onSubmit={(e) => {
            e.preventDefault();
            handleOtpSubmit();
          }}
        >
          <p className={styles.formTitle}>Код подтверждения</p>
          <p className={styles.formSubtitle}>
            Введите 6-значный код из приложения-аутентификатора
          </p>

          <div
            key={otpShakeKey}
            className={[styles.otpContainer, otpError ? styles.shake : ''].join(
              ' '
            )}
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
                className={[
                  styles.otpInput,
                  otpError ? styles.otpError : '',
                ].join(' ')}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
              />
            ))}
          </div>

          {otpError && (
            <p className={styles.errorMessage}>
              Неверный код. Попробуйте ещё раз
            </p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Проверка…' : 'Подтвердить'}
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setOtpError(false);
              setStage(STAGE.RECOVERY);
            }}
          >
            Проблемы с аутентификатором?
          </button>
        </form>
      )}

      {/* ── RECOVERY ── */}
      {stage === STAGE.RECOVERY && (
        <form
          className={styles.formMain}
          onSubmit={(e) => {
            e.preventDefault();
            handleRecoverySubmit();
          }}
        >
          <p className={styles.formTitle}>Код восстановления</p>
          <p className={styles.formSubtitle}>
            Введите резервный код, сохранённый при настройке аккаунта
          </p>

          <div
            key={recoveryShakeKey}
            className={recoveryError ? styles.shake : ''}
          >
            <input
              className={[
                styles.recoveryInput,
                recoveryError ? styles.inputError : '',
              ].join(' ')}
              type="text"
              placeholder="xxxx-xxxx-xxxx"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
            />
          </div>

          {recoveryError && (
            <p className={styles.errorMessage}>Неверный код восстановления</p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Проверка…' : 'Войти'}
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setRecoveryError(false);
              setStage(STAGE.OTP);
            }}
          >
            Вернуться к коду из приложения
          </button>
        </form>
      )}
    </section>
  );
};

export default LoginPage;
