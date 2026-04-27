/** @type {import('tailwindcss').Config} */
// SPEC v3.2 §2.2 準拠 — プライマリカラー: ディープティール（青緑寄りの深い青）
// 主軸 700 = #1B4965（信頼の深さ + 緑寄りの温度）
module.exports = {
  content: ['./*.html', './**/*.html', '!./node_modules/**'],
  theme: {
    extend: {
      colors: {
        // プライマリ: ディープティール
        // 700 を主軸として、上下の階調を WCAG コントラスト基準を満たすよう設計
        teal: {
          50:  '#f0f6f9',
          100: '#d9e7ee',
          200: '#b3cfdc',
          300: '#7eb0c5',
          400: '#4a8aa6',
          500: '#2c6e8c',
          600: '#225770',
          700: '#1B4965',
          800: '#143548',
          900: '#0d2333',
        },
        // ニュートラル（SPEC §2.2 原則固定）
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        display: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
