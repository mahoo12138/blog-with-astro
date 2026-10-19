import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

// 一段侧栏寄语，不再套一张与文章争夺视觉权重的卡片。
export const note = style({
	margin: '0 16px 28px', padding: '16px 0 0', minWidth: 0,
	borderTop: `1px solid ${vars.color.border}`,
});
export const title = style({
	margin: '0 0 8px', fontFamily: vars.font.body, fontSize: '12px',
	fontWeight: 600, lineHeight: 1.6, color: vars.color.textMuted,
});
export const text = style({
	margin: 0, fontSize: '13px', lineHeight: 1.85, color: vars.color.textMuted,
	textWrap: 'balance', overflowWrap: 'anywhere',
});
