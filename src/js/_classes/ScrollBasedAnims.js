import VirtualScroll from "virtual-scroll";
import { gsap, Expo, Linear, Sine } from "gsap";
import { globalStorage, domStorage } from "../_global/storage";

export class ScrollBasedAnims {
  constructor(options = {}) {
    this.isVS = true;
    this.isMobile = globalStorage.isMobile;

    if (this.isMobile || globalStorage.isFirefox) {
      this.isVS = false;
    }

    this.bindMethods();

    gsap.defaults({
      ease: "Linear.easeNone"
    });

    this.el = this.isVS ? domStorage.mainEl : document.body;

    this.thisPagesTLs = [];
    this.offsetVal = 0;
    this.body = document.body;
    this.direction = 'untouched';
    this.transitioning = false;

    const {
      sections = !this.isVS ? false : this.el.querySelectorAll('[data-smooth]'), // ONLY COLLECT DATA-SMOOTH SECTIONS IF isVS
      dataFromElems = this.el.querySelectorAll('[data-from]'),
      dataHeroFromElems = document.querySelectorAll('[data-h-from]'), // DATA HERO FROM MATH IS A LITTLE DIFFERNT
      heroMeasureEl = this.el.querySelector('.hero .measure-el'),
      footerMeasureEl = document.querySelector('#footer .measure-el'),
      scrollBasedElems = this.el.querySelectorAll('[data-entrance]'),
      threshold = 200,
      ease = 0.18,
      mouseMultiplier = (["Win32", "Win64", "Windows", "WinCE"].indexOf(window.navigator.platform) !== -1 ? 0.6 : 0.25),
      preventTouch = true,
      passive = true,
      // OUR EXAMPLE TOP SCROLL BAR
      scrollIndicator = document.getElementById('scroll-progress')
    } = options;

    this.dom = {
      el: this.el,
      // namespace: this.namespace,
      sections: sections,
      dataFromElems: dataFromElems,
      dataHeroFromElems: dataHeroFromElems,
      scrollBasedElems: scrollBasedElems,
      heroMeasureEl: heroMeasureEl,
      footerMeasureEl: footerMeasureEl,
      scrollIndicator: scrollIndicator
    };

    this.sections = null;
    this.dataFromElems = null;
    this.dataHeroFromElems = null;
    this.scrollBasedElems = null;
    // this.namespace = null;
    this.raf = null;

    this.state = {
      resizing: false
    };

    this.data = {
      threshold: threshold,
      ease: ease,
      current: 0,
      last: 0,
      target: 0,
      height: 0,
      max: 0
    };

    if (this.isVS) {
      this.vs = new VirtualScroll({
        el: this.el,
        mouseMultiplier: mouseMultiplier,
        preventTouch: preventTouch,
        passive: passive
      });

      const inputs = document.querySelectorAll('input:not(.bound), textarea:not(.bound)');
      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        input.classList.add('bound');
        input.addEventListener('focus', () => {
          document.removeEventListener('keydown', this.vs._onKeyDown)
        });
        input.addEventListener('blur', () => {
          document.addEventListener('keydown', this.vs._onKeyDown)
        });
      }
    }

    this.init();

    if (globalStorage.windowWidth > 767) {
      let length = this.dom.scrollBasedElems.length;
      for (let i = 0; i < length; i++) {
        const entranceEl = this.dom.scrollBasedElems[i];
        const entranceType = entranceEl.dataset.entrance;
        const entranceTL = new gsap.timeline({ paused: true });

        switch (entranceType) {
          case 'scale-bg':
            const bg = entranceEl.querySelector('.scale-bg');
            entranceTL
                .fromTo(bg, 1.2, { scaleY: 0 }, { scaleY: 1, ease: Expo.easeOut, force3D: true })

            this.thisPagesTLs.push(entranceTL);
            break;

          case "stagger-fade":
            let staggerEls = entranceEl.querySelectorAll('.stagger-el');

            entranceTL
                .fromTo(staggerEls, 0.7, { autoAlpha:0 }, { autoAlpha: 1, stagger: .12, force3D: true });

            this.thisPagesTLs.push(entranceTL);
            break;

          default:

            break;
        }
      }
    }
  }

  bindMethods() {
    ['run', 'event', 'resize']
        .forEach(fn => this[fn] = this[fn].bind(this));
  }

  init() {
    this.on();
  }

  on() {
    if (this.isVS) {
      this.dom.el.classList.add('is-vs');
      this.setStyles();
      this.vs.on(this.event);
    }
    this.getBounding();
    this.getCache();
    this.requestAnimationFrame();
  }

  setStyles() {
    this.dom.el.style.position = 'fixed';
    this.dom.el.style.top = 0;
    this.dom.el.style.left = 0;
    this.dom.el.style.width = '100%';
  }

  event(e) {
    this.data.target += Math.round(e.deltaY * -1);
    this.clamp();
  }

  clamp() {
    this.data.target = Math.round(Math.min(Math.max(this.data.target, 0), this.data.max));
  }

  run() {
    if (this.state.resizing || this.transitioning) return;

    if (this.isVS) {

      this.data.current += (this.data.target - this.data.current) * this.data.ease;
      this.transformSections();
      this.getDirection();
      this.data.last = this.data.current;
    } else {

      this.data.current = window.scrollY;
      if (this.data.current === this.data.last) {
        this.requestAnimationFrame();
        return;
      }
      this.getDirection();
      this.data.last = this.data.current;
    }

    this.scrollProgress(); // example function built for dummy markup on home php/css file

    if (!globalStorage.reducedMotion) {
      this.checkScrollBasedLoadins();
      this.animateDataHeroFromElems();
      this.animateDataFromElems();
      this.animateFooterReveal();
    }
    this.requestAnimationFrame();
  }

  getDirection() {
    if (this.data.last - this.data.current < 0) {
      // DOWN
      if (this.direction === 'down' || this.data.current <= 0) { return; }
      this.direction = 'down';
    } else if (this.data.last - this.data.current > 0) {
      // UP
      if (this.direction === 'up') { return; }
      this.direction = 'up';
    }
  }

  scrollProgress() {
    if (this.direction === "untouched" || !this.dom.scrollIndicator) { return }

    let scrollProgress =  this.data.current / this.data.max;

    gsap.set(this.scrollProgressData.scrollBar, { scaleX: scrollProgress })
  }

  getSections() {
    if (!this.dom.sections) return;
    this.sections = [];
    let length = this.dom.sections.length;
    for (let i = 0; i < length; i++) {
      let el = this.dom.sections[i]
      el.style.transform = '';
      const bounds = el.getBoundingClientRect();
      this.sections.push({
        top: (bounds.top + this.data.current),
        bottom: (bounds.bottom + this.data.current)
      });
    }
  }

  getScrollBasedSections() {
    if (!this.dom.scrollBasedElems || this.isMobile) return
    this.scrollBasedElems = []
    let length = this.dom.scrollBasedElems.length;
    for (let i = 0; i < length; i++) {
      if (i < this.offsetVal) { continue }
      let el = this.dom.scrollBasedElems[i]
      const bounds = el.getBoundingClientRect()
      this.scrollBasedElems.push({
        el: el,
        played: false,
        top: (bounds.top + this.data.current) > this.data.height ? (bounds.top + this.data.current) : this.data.height,
        bottom: (bounds.bottom + this.data.current),
        height: (bounds.bottom - bounds.top),
        offset: globalStorage.windowWidth < 768 ? (el.dataset.offsetMobile * globalStorage.windowHeight) : (el.dataset.offset * globalStorage.windowHeight)
      })
    }

  }

  bringInScrollBasedSections() {
    if (this.thisPagesTLs.length !== this.offsetVal) {

      let length = this.scrollBasedElems.length;
      for (let i = 0; i < length; i++) {
        let data = this.scrollBasedElems[i]

        if (data.played) { continue }

        if ((this.data.current + data.offset) > data.top) {
          this.thisPagesTLs[this.offsetVal].progress(1);
          this.offsetVal++;
          data.played = true;
        }
      }
    }
  }

  getDataFromElems() {
    if (!this.dom.dataFromElems) return;

    this.dataFromElems = [];

    let useMobile = globalStorage.windowWidth < 768;

    let length = this.dom.dataFromElems.length
    for (let i = 0; i < length; i++) {
      let el = this.dom.dataFromElems[i]
      let from, to, dur;
      const bounds = el.getBoundingClientRect()
      const tl = new gsap.timeline({ paused: true })

      if (useMobile) {
        from = el.dataset.mobileFrom ? JSON.parse(el.dataset.mobileFrom) : JSON.parse(el.dataset.from);
        to = el.dataset.mobileTo ? JSON.parse(el.dataset.mobileTo) : JSON.parse(el.dataset.to);
        if (el.dataset.mobileDur) {
          dur = el.dataset.mobileDur;
        } else {
          dur = el.dataset.dur ? el.dataset.dur : 1;
        }
      } else {
        from = JSON.parse(el.dataset.from);
        to = JSON.parse(el.dataset.to);
        dur = el.dataset.dur ? el.dataset.dur : 1;
      }

      tl.fromTo(el, 1, from, to)

      this.dataFromElems.push({
        el: el,
        tl: tl,
        top: (bounds.top + this.data.current) > this.data.height ? (bounds.top + this.data.current) : this.data.height,
        bottom: (bounds.bottom + this.data.current),
        height: bounds.bottom - bounds.top,
        duration: dur,
        progress: {
          current: 0
        }
      })
    }

  }

  getHeroMeasureEl() {
    if (!this.dom.heroMeasureEl) return;
    const el = this.dom.heroMeasureEl;
    const bounds = el.getBoundingClientRect();
    this.heroMeasureData = {
      top: (bounds.top + this.data.current) > this.data.height ? (bounds.top + this.data.current) : this.data.height,
      bottom: (bounds.bottom + this.data.current),
      height: bounds.bottom - bounds.top,
      progress: {
        current: 0
      }
    };
  }

  getFooterMeasureEl() {
    if (!this.dom.footerMeasureEl) return;
    const el = this.dom.footerMeasureEl;
    const bounds = el.getBoundingClientRect();
    this.footerRevealTL = new gsap.timeline({ paused: true })
    this.footerRevealTL
        .fromTo("#footer h5", 1, { y: 200, rotation: 540, opacity: 0 }, { y: 0, rotation: 0, opacity: 1 });

    this.footerMeasureData = {
      top: (bounds.top + this.data.current) > this.data.height ? (bounds.top + this.data.current) : this.data.height,
      bottom: (bounds.bottom + this.data.current),
      height: bounds.bottom - bounds.top,
      duration: (this.data.height / (bounds.bottom - bounds.top)).toFixed(2)
    };
  }

  getDataHeroFromElems() {
    if (!this.dom.dataHeroFromElems) return;

    this.dataHeroFromElems = [];
    const useMobile = globalStorage.windowWidth < 768;
    for (let i = 0; i < this.dom.dataHeroFromElems.length; i++) {
      let el = this.dom.dataHeroFromElems[i]
      let from, to;
      const tl = new gsap.timeline({ paused: true });

      if (useMobile) {
        from = el.dataset.hMobileFrom ? JSON.parse(el.dataset.hMobileFrom) : JSON.parse(el.dataset.hFrom);
        to = el.dataset.mobileTo ? JSON.parse(el.dataset.mobileTo) : JSON.parse(el.dataset.to);
      } else {
        from = JSON.parse(el.dataset.hFrom);
        to = JSON.parse(el.dataset.to);
      }

      tl.fromTo(el, 1, from, to);

      this.dataHeroFromElems.push({
        el: el,
        tl: tl,
        progress: {
          current: 0
        }
      })
    }
  }

  transformSections() {
    if (!this.sections) return;

    const translate = this.data.current.toFixed(2);

    let length = this.sections.length;
    for (let i = 0; i < length; i++) {
      let data = this.sections[i]
      const { isVisible } = this.isVisible(data);

      if (isVisible || this.state.resizing) gsap.set(this.dom.sections[i], { y: -translate, force3D: true, ease: Linear.easeNone });
    }
  }

  animateDataHeroFromElems() {
    if (this.direction === "untouched" || !this.heroMeasureData) return;
    const { isVisible } = ( this.isVisible(this.heroMeasureData) );
    if (!isVisible) return;
    let percentageThrough = (this.data.current / this.heroMeasureData.height).toFixed(3);

    if (percentageThrough <= 0) {
      percentageThrough = 0;
    } else if (percentageThrough >= 1) {
      percentageThrough = 1;
    }
    console.log(percentageThrough)
    let length = this.dataHeroFromElems.length;
    for (let i = 0; i < length; i++) {
      let data = this.dataHeroFromElems[i]
      data.tl.progress(percentageThrough)
    }
  }

  animateFooterReveal() {
    if (this.direction === "untouched" || !this.dom.footerMeasureEl) return;
    const { isVisible, start, end } = ( this.isVisible(this.footerMeasureData, 0.01) );
    if (!isVisible) {
      this.footerRevealTL.progress(0);
      return;
    }
    let percentageThrough = ((((start).toFixed(2) / this.data.height).toFixed(3) - 1) * -1) * this.footerMeasureData.duration;
    if (percentageThrough <= 0) {
      percentageThrough = 0;
    } else if (percentageThrough >= 1) {
      percentageThrough = 1;
    }
    console.log(percentageThrough);
    this.footerRevealTL.progress(percentageThrough);
  }

  animateDataFromElems() {
    if (this.direction === "untouched" || !this.dataFromElems) return

    let length = this.dataFromElems.length;
    for (let i = 0; i < length; i++) {
      let data = this.dataFromElems[i]

      const { isVisible, start, end } = this.isVisible(data, 50);

      if (isVisible) {

        this.intersectRatio(data, start, end)

        data.tl.progress(data.progress.current)
      }
    }
  }

  checkScrollBasedLoadins() {
    if (this.direction === "untouched" || !this.scrollBasedElems) { return }
    if (this.thisPagesTLs.length !== this.offsetVal) {
      let length = this.scrollBasedElems.length;
      for (let i = 0; i < length; i++) {
        let data = this.scrollBasedElems[i];

        if (data.played) { continue }

        if ((this.data.current + data.offset) > data.top) {
          this.thisPagesTLs[this.offsetVal].play();
          this.offsetVal++;
          data.played = true;
        }
      }
    }
  }

  intersectRatio(data, top, bottom) {
    const start = top - this.data.height;
    if (start > 0) { return }
    const end = (this.data.height + bottom + data.height) * data.duration;
    data.progress.current = Math.abs(start / end);
    data.progress.current = Math.max(0, Math.min(1, data.progress.current));
  }

  isVisible(bounds, offset) {
    const threshold = !offset ? this.data.threshold : offset;
    const start = bounds.top - this.data.current;
    const end = bounds.bottom - this.data.current;
    const isVisible = start < (threshold + this.data.height) && end > -threshold;
    return {
      isVisible,
      start,
      end
    };
  }

  requestAnimationFrame() {
    this.raf = requestAnimationFrame(this.run);
  }

  cancelAnimationFrame() {
    cancelAnimationFrame(this.raf);
  }

  getCache() {
    if (this.isVS) {
      this.getSections();
    }

    if (globalStorage.reducedMotion) { return; }

    this.getScrollBasedSections();
    this.getDataHeroFromElems();
    this.getDataFromElems();
    this.getHeroMeasureEl();
    this.getFooterMeasureEl();
    this.getScrollProgressData();
  }

  getScrollProgressData() {
    if (!this.dom.scrollIndicator) return
    const el = this.dom.scrollIndicator;
    const scrollBar = el.querySelector('.indicator')
    const indicators = el.querySelectorAll('.indicator');
    const trackHeight = Math.round(el.offsetHeight)
    const indicatorHeight = Math.round(indicators[0].offsetHeight);

    gsap.set(el, { height: trackHeight })
    gsap.set(indicators, { height: indicatorHeight })

    const scrollDist = trackHeight - scrollBar.offsetHeight;

    this.scrollProgressData = {
      scrollDist: scrollDist,
      scrollBar: scrollBar
    };
  }

  getBounding() {
    this.data.height = globalStorage.windowHeight;
    this.data.max = this.dom.el.offsetHeight - globalStorage.windowHeight;
  }

  resize() {
    let omnibar = false;
    if (globalStorage.windowWidth === this.data.width && this.isMobile) {
      omnibar = true;
    }
    this.state.resizing = true;
    if (!omnibar) {
      this.getCache();
      this.getBounding();
    }
    if (this.isVS) {
      this.transformSections();
    }
    this.state.resizing = false;
  }


  scrollTo(val) {
    this.state.scrollingTo = true;
    if (!this.isVS) {
      gsap.to(this.el, 1, { scrollTop: val, ease: Sine.easeInOut, onComplete: () => { this.state.scrolling = false } })
    } else {
      gsap.to(this.data, 0.7, { target: val, ease: Sine.easeInOut, onComplete: () => { this.state.scrolling = false } })
    }
  }

  destroy() {
    this.transitioning = true; // WE DESTROY THE CLASS ISNTANCE ON GLOBAL LEAVE

    if (this.isVS) {
      this.vs.off(this.event);
      this.dom.el.classList.remove('is-vs');
      this.vs.destroy();
    }
    this.state.rafCancelled = true;
    this.cancelAnimationFrame();

    this.dom = null;
    this.data = null;
    this.raf = null;
  }
}
