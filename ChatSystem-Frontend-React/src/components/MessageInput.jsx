/**
 * 消息输入组件
 */

import { useState } from 'react';

export default function MessageInput({ onSend }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="px-6 py-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                {/* 附件按钮 */}
                <button
                    type="button"
                    className="p-2.5 text-gray-400 hover:text-[#0B4F6C] hover:bg-[#E0F2F7] rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                {/* 图片按钮 */}
                <button
                    type="button"
                    className="p-2.5 text-gray-400 hover:text-[#0B4F6C] hover:bg-[#E0F2F7] rounded-xl transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* 输入框 */}
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入消息..."
                        rows={1}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C] transition-all"
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                {/* 发送按钮 */}
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2.5 bg-[#0B4F6C] text-white rounded-xl hover:bg-[#0a4560] transition-colors shadow-md shadow-[#0B4F6C]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
