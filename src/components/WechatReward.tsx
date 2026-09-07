import { LucideIcon } from './LucideIcon';

interface WechatRewardProps {
  onOpenModal?: () => void;
}

export function WechatRewardMenuItem({ onOpenModal }: WechatRewardProps) {
  return (
    <div 
      className="workspace-reward-item"
      onClick={(e) => {
        // 防止点击内部元素冒泡导致菜单异常闪退
        e.stopPropagation();
      }}
    >
      <button 
        type="button" 
        className="workspace-reward-trigger" 
        onClick={() => onOpenModal?.()}
        title="微信赞赏码（悬浮查看）"
      >
        <div className="reward-trigger-left">
          <LucideIcon name="QrCode" size={16} className="text-emerald-600" />
          <span>微信赞赏码</span>
        </div>
        <span className="reward-trigger-badge">支持</span>
      </button>

      {/* 桌面端悬浮卡片 */}
      <div className="workspace-reward-popover" role="tooltip" aria-label="微信赞赏码">
        <div className="reward-popover-arrow" />
        <div className="reward-popover-content">
          <div className="reward-card-header">
            <div className="reward-badge-icon">
              <LucideIcon name="Heart" size={15} />
            </div>
            <div className="reward-header-text">
              <h4 className="reward-title">微信赞赏码</h4>
              <p className="reward-subtitle">如果 CraftCV 帮到了你</p>
            </div>
          </div>

          <div className="reward-qr-frame">
            <img 
              src="/wechat-reward.jpg" 
              alt="微信赞赏码" 
              className="reward-qr-img" 
              loading="lazy" 
              draggable={false} 
            />
          </div>

          <div className="reward-card-footer">
            <LucideIcon name="Coffee" size={13} />
            <span>欢迎请作者喝杯咖啡 · 感谢支持</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WechatRewardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="reward-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="微信赞赏码">
      <div className="reward-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="reward-modal-close" onClick={onClose} aria-label="关闭">
          <LucideIcon name="X" size={18} />
        </button>

        <div className="reward-modal-header">
          <div className="reward-modal-icon">
            <LucideIcon name="Heart" size={18} />
          </div>
          <div>
            <h3 className="reward-modal-title">微信赞赏码</h3>
            <p className="reward-modal-subtitle">您的认可与支持，是持续打磨的动力</p>
          </div>
        </div>

        <div className="reward-modal-qr-frame">
          <img 
            src="/wechat-reward.jpg" 
            alt="微信赞赏码" 
            className="reward-modal-qr-img" 
            draggable={false} 
          />
        </div>

        <div className="reward-modal-footer">
          <LucideIcon name="Coffee" size={14} />
          <span>长按识别或使用微信扫一扫 · 感谢支持</span>
        </div>
      </div>
    </div>
  );
}
