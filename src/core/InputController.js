
export class InputController {
  constructor({ onLaneChange, onJump, onSlide }) {
    this.onLaneChange = onLaneChange;
    this.onJump = onJump;
    this.onSlide = onSlide;

    this._bindKeyboard();
    this._bindSwipe();
    this._bindOnScreenButtons();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.onLaneChange(-1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.onLaneChange(1);
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.onJump();
          event.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.onSlide();
          break;
      }
    });
  }

  _bindSwipe() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    window.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    }, { passive: true });

    window.addEventListener('touchend', (event) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Date.now() - startTime > 600) return;

      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal && Math.abs(dx) > 34) {
        this.onLaneChange(dx > 0 ? 1 : -1);
      } else if (!horizontal && Math.abs(dy) > 34) {
        dy < 0 ? this.onJump() : this.onSlide();
      }
    }, { passive: true });
  }

  _bindOnScreenButtons() {
    this._wireButton('btnLeft', () => this.onLaneChange(-1));
    this._wireButton('btnRight', () => this.onLaneChange(1));
    this._wireButton('btnJump', () => this.onJump());
    this._wireButton('btnSlide', () => this.onSlide());
  }

  _wireButton(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (event) => {
      event.preventDefault();
      handler();
    });
  }
}
