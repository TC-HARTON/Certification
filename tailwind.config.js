/** @type {import('tailwindcss').Config} */
// HARTON Certified Tailwind 設定
// MASTER-PLAN §2.4 ブランドカラーシステム（確定済 / 議論再開禁止）
// MASTER-PLAN §2.6 タイポグラフィ方針（serif / sans / tabular-nums）
// 旧 tcharton 配色（teal/dark）は spec-checker のコントラスト固定検査整合のため保持
module.exports = {
  content: ['./*.html', './**/*.html', '!./node_modules/**'],
  theme: {
    extend: {
      colors: {
        // ─── MASTER-PLAN §2.4 ブランドカラー ─────────
        // Primary（主役）: 教養・信頼・知性（Bloomberg / The Economist / IBM 等の公的権威色）
        'navy-deep': '#0F172A',
        'navy-mid':  '#1E293B',
        // Accent（アクセント）: 認定・名誉・★区分（ミシュラン構造との整合）
        'champagne-gold': '#C9A961',
        'classic-gold':   '#D4AF37',
        // Background: ガイドブック感、純白より柔らかく公式刊行物的
        'cream-base': '#FAF8F3',
        'cream-soft': '#F5F2EA',
        // Body Text
        charcoal: '#1F2937',

        // ─── 旧 tcharton 配色（spec-checker 固定値整合のため保持） ───
        teal: {
          50:  '#f0f6f9', 100: '#d9e7ee', 200: '#b3cfdc', 300: '#7eb0c5',
          400: '#4a8aa6', 500: '#2c6e8c', 600: '#225770', 700: '#1B4965',
          800: '#143548', 900: '#0d2333',
        },
        dark: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      fontFamily: {
        // MASTER-PLAN §2.6 — 見出し serif（Playfair Display / Cormorant Garamond）/ 本文 Inter + Noto Sans JP
        sans:    ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        serif:   ['"Playfair Display"', '"Cormorant Garamond"', '"Noto Serif JP"', '"Hiragino Mincho ProN"', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', '"Noto Serif JP"', 'serif'],
      },
      fontVariantNumeric: {
        'tabular': 'tabular-nums',
      },
    },
  },
  plugins: [],
};
