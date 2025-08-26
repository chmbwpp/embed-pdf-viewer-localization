// translate-pdf.ts
export interface TranslationMap {
  [key: string]: string;
}

export default class TranslatePDF {
  private readonly root: Node;
  private readonly map: Readonly<TranslationMap>;
  private observer?: MutationObserver;

  constructor(root: Node, map: TranslationMap = {}) {
    if (!root) {
      throw new Error('TranslatePDF: rootNode is required');
    }
    this.root = root;
    this.map = Object.freeze(map);
    this.translate(this.root);
    this.startObserver();
  }

  /* ---------- 私有方法 ---------- */
  private translate(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent ?? '';
      // 精准匹配
      if (this.map[text]) {
        node.textContent = this.map[text];
        return;
      }
      // 关键词替换
      Object.keys(this.map).forEach(k => {
        text = text.replace(new RegExp(k, 'g'), this.map[k]);
      });
      node.textContent = text;
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      (['aria-label', 'title', 'placeholder'] as const).forEach(attr => {
        if (el.hasAttribute(attr)) {
          let val = el.getAttribute(attr) ?? '';
          Object.keys(this.map).forEach(k => {
            val = val.replace(new RegExp(k, 'g'), this.map[k]);
          });
          el.setAttribute(attr, val);
        }
      });
    }

    node.childNodes.forEach(n => this.translate(n));
  }

  private startObserver(): void {
    this.observer = new MutationObserver(ms => {
      this.observer?.disconnect();
      ms.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => this.translate(n));
        }
        if (m.type === 'characterData') {
          this.translate(m.target);
        }
      });
      this.observe();
    });
    this.observe();
  }

  private observe(): void {
    this.observer?.observe(this.root, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  /* ---------- 公开方法 ---------- */
  public destroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}