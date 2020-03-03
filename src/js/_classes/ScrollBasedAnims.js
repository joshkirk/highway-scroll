import VirtualScroll from "virtual-scroll";
import { gsap, Expo, Linear, Sine } from "gsap";
import { globalStorage, domStorage } from "../_global/storage";

export class ScrollBasedAnims {
  constructor(options = {}) {
    this.isVS = true; // Whether to use VS or native scroll for all animations
    this.isMobile = globalStorage.isMobile;

    if (this.isMobile || globalStorage.isFirefox) { // Both mobile and FF perform much better without VS
      this.isVS = false;
    }

    this.bindMethods();

    gsap.defaults({
      ease: "Linear.easeNone" // You want the ease of animations to be 1:1 with the scroll of the user's mouse if native (or the VS ease)
    });

    this.el = this.isVS ? domStorage.containerEl : document.body;

    this.thisPagesTLs = []; // Array that will hold all the [data-entrance] timelines
    this.offsetVal = 0; // Value used to check against so we don't play [data-entrance] timelines more than once
    this.body = document.body;
    this.direction = 'untouched'; // Updated to either "up" or "down" in the run function
    this.transitioning = false;

    const {
      sections = !this.isVS ? false : this.el.querySelectorAll('[data-smooth]'), // Only collect [data-smooth] sectoins if this.isVS
      dataFromElems = this.el.querySelectorAll('[data-from]'), // Elements that transition between the values placed on the element in the markup
      dataHeroFromElems = document.querySelectorAll('[data-h-from]'), // [data-h-from] math differs a little
      heroMeasureEl = this.el.querySelector('.hero .measure-el'), // Use css to make the .measure-el within the hero whatever height you want. When it's gone, the animation is complete
      footerMeasureEl = document.querySelector('#footer .measure-el'), // Same goes for the footer measure element
      scrollBasedElems = this.el.querySelectorAll('[data-entrance]'), // Elements that have a certain entrance once, when scrolled into view
      threshold = 200, // Default pixel distance for this.isVisible to say yes this element is visible. We only animate against elements that are visible
      ease = 0.18, // VS ease
      // PC users deserve some consideration too, generally scroll devices can vary greatly on PC and the scroll events emitted will be far less frequent/reliable for easing purposes,
      // so we just jack it up since we'll be easing it anyways. Only used if VS is turned on
      mouseMultiplier = (["Win32", "Win64", "Windows", "WinCE"].indexOf(window.navigator.platform) !== -1 ? 0.6 : 0.25),
      preventTouch = true,
      passive = true,
      scrollIndicator = document.getElementById('scroll-progress') // The progress bar on top. This is just an example of data collection and animation
    } = options;

    this.dom = { // Save values to this.dom so we can just destroy that on leave
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
      currentScrollY: 0,
      last: 0,
      target: 0,
      height: 0,
      width: globalStorage.windowWidth,
      max: 0
    };

    if (this.isVS) { // If VS, instantiate the VS and bind inputs/textarea so you can press space without scrolling down while focused
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

    if (globalStorage.windowWidth > 767) { // I turn [data-entrance] animations off on mobile because I prefer a more simple mobile experience with just a few key animations, instead of many elements fading in, etc.
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

  on() { // Note how we take all measurements (getBounding & getCache) whether it's VS or not. Using native scroll we're still going to animate everything exactly the same in run()
    if (this.isVS) {
      this.dom.el.classList.add('is-vs');
      this.setStyles();
      this.vs.on(this.event);
    }
    this.getBounding();
    this.getCache();
    this.requestAnimationFrame();
  }

  setStyles() { // Only called if isVS
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

  run() { // The RAF engine
    if (this.state.resizing || this.transitioning) return;

    if (this.isVS) { // If isVS, use those the simulated pageY values

      this.data.current += (this.data.target - this.data.current) * this.data.ease;
      this.transformSections(); // If isVS, transform the [data-smooth] sections
      // Notice in both cases, this.getDirection() is called in between setting this.data.current and this.data.last, so we can measure deltas and know if we're going up or down
      this.getDirection();
      this.data.last = this.data.current;

    } else { // else if native scroll do everything the same except we're just setting this.data.current to be the literal window.scrollY
             // checking the window.scrollY causes a reflow, but the performance of everything is so tight, that is okay :D
      this.data.current = window.scrollY;
      this.data.currentScrollY = this.data.current;
      if (this.data.current === this.data.last) { // Don't run the animation cycle if they haven't scrolled
        this.requestAnimationFrame();
        return;
      }
      // Notice in both cases, this.getDirection() is called in between setting this.data.current and this.data.last, so we can measure deltas and know if we're going up or down
      this.getDirection();
      this.data.last = this.data.current;
    }

    this.scrollProgress(); // Example animation function that animates a progress bar

    if (!globalStorage.reducedMotion) { // You need to make sure all elements have proper positioning if not animated, or remove this check
      this.checkScrollBasedLoadins();
      this.animateDataHeroFromElems();
      this.animateDataFromElems();
      this.animateFooterReveal();
    }
    this.playPauseVideos();
    // Do it all over again. Note that even for native scroll, we're running a RAF and not just relying on the scroll event to fire the run() function. It's much more reliable and smooth.
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

  playPauseVideos() {
    if (this.direction === "untouched") return;
    for (let i = 0; i < this.videosDataLength; i++) {
      let data = this.videosData[i];
      let { isVisible } = this.isVisible(data, 50)
      if (isVisible) {
        if (!data.playing) {
          data.el.play();
          data.playing = true;
        }
      } else if (!isVisible && data.playing) {
        data.el.pause();
        data.el.currentTime = 0;
        data.playing = false;
      }
    }
  }

  scrollProgress() {
    if (this.direction === "untouched" || !this.dom.scrollIndicator) { return }

    let scrollProgress =  this.data.current / this.data.max;

    gsap.set(this.scrollProgressData.scrollBar, { scaleX: scrollProgress })
  }

  getSections() { // [data-smooth] sections, which are only present if isVS
    if (!this.dom.sections) return;
    this.sections = [];
    let length = this.dom.sections.length;
    for (let i = 0; i < length; i++) {
      let el = this.dom.sections[i]
      el.style.transform = '';
      const bounds = el.getBoundingClientRect();
      this.sections.push({
        top: (bounds.top + this.data.currentScrollY),
        bottom: (bounds.bottom + this.data.currentScrollY)
      });
    }
  }

  getVideos() {
    let playPauseVideos = document.querySelectorAll('.play-in-view')
    this.videosData = []

    for (let i = 0; i < playPauseVideos.length; i++) {
      let bounds = playPauseVideos[i].getBoundingClientRect()
      this.videosData.push({
        el: playPauseVideos[i],
        playing: false,
        top: (bounds.top + this.data.currentScrollY) > this.data.height ? (bounds.top + this.data.currentScrollY) : this.data.height,
        bottom: (bounds.bottom + this.data.currentScrollY),
      })
    }
    this.videosDataLength = this.videosData.length
  }

  getScrollBasedSections() { // [data-entrance] sections that animate once when they hit a certain threshold in the viewport
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
        top: (bounds.top + this.data.currentScrollY) > this.data.height ? (bounds.top + this.data.currentScrollY) : this.data.height,
        bottom: (bounds.bottom + this.data.currentScrollY),
        height: (bounds.bottom - bounds.top),
        offset: globalStorage.windowWidth < 768 ? (el.dataset.offsetMobile * globalStorage.windowHeight) : (el.dataset.offset * globalStorage.windowHeight)
      })
    }

  }

  getDataFromElems() { // [data-from] elements that animate forward and backward as you scroll up and down. Note you can optionally have [data-mobile-from] & [data-mobile-to] on your elements
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
        top: (bounds.top + this.data.currentScrollY) > this.data.height ? (bounds.top + this.data.currentScrollY - (this.isMobile ? 40 : 0)) : this.data.height,
        bottom: (bounds.bottom + this.data.currentScrollY - (this.isMobile ? 40 : 0)),
        height: bounds.bottom - bounds.top,
        from: from,
        duration: dur,
        progress: {
          current: 0
        }
      })
    }

  }

  getHeroMeasureEl() { // Measure the .measure-el within .hero so we know when the [data-h-from] element animations should be complete
    if (!this.dom.heroMeasureEl) return;
    const el = this.dom.heroMeasureEl;
    const bounds = el.getBoundingClientRect();
    this.heroMeasureData = {
      top: (bounds.top + this.data.currentScrollY) > this.data.height ? (bounds.top + this.data.currentScrollY) : this.data.height,
      bottom: (bounds.bottom + this.data.currentScrollY),
      height: bounds.bottom - bounds.top,
      progress: {
        current: 0
      }
    };
  }

  getFooterMeasureEl() {
    // Same as the getHeroMeasureEl() but the math is again slightly different. Here we're determining when a bottom-of-the-screen element is 100% in.
    // In the previous function we're gathering data so we can determine when an already-visible element is 100% out.
    // In the next function we'll get the elements that use a 0-1 intersectRatio() to animate forward and backward as they pass through the viewport
    if (!this.dom.footerMeasureEl || this.isMobile) return;
    const el = this.dom.footerMeasureEl;
    const bounds = el.getBoundingClientRect();
    this.footerRevealTL = new gsap.timeline({ paused: true })
    this.footerRevealTL
        .fromTo("#footer h5", 1, { y: 200, rotation: 540, opacity: 0 }, { y: 0, rotation: 0, opacity: 1 });

    this.footerMeasureData = {
      top: (bounds.top + this.data.currentScrollY) > this.data.height ? (bounds.top + this.data.currentScrollY) : this.data.height,
      bottom: (bounds.bottom + this.data.currentScrollY),
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
    // console.log(percentageThrough)
    let length = this.dataHeroFromElems.length;
    for (let i = 0; i < length; i++) {
      let data = this.dataHeroFromElems[i]
      data.tl.progress(percentageThrough)
    }
  }

  animateFooterReveal() {
    if (this.direction === "untouched" || !this.footerMeasureData) return;
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

      const { isVisible, start, end } = this.isVisible(data, 0.01);

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
    this.getVideos();
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
    this.data.height = globalStorage.windowHeight + (this.isMobile ? 100 : 0);
    this.data.max = (this.dom.el.getBoundingClientRect().height - this.data.height) + (this.isMobile ? 100 : 0);
  }

  resize(omnibar = false) {
    // Okay so this is some shit. We either lock the body height and overflow so the omnibar can't collapse, or we do the below..
    // Basically if we can assume it's just the omnibar collapsing, don't re-measure things and just keep measuring off the un-collapsed omnibar height. This allows for
    // scroll based animations to continue smoothly during omnibar collapse.

    // I haven't been able to animate the footer reveal properly without locking the body so you'll notice the footer reveal is currently only being done on desktop :(
    // If you lock the body overflow so the body can't collapse you can remove the omnibar stuff from this function and animate an awesome footer reveal too, I wouldn't blame you.

    this.state.resizing = true;
    if (!omnibar) {
      this.getCache();
      if (this.isVS) {
        this.transformSections();
      }
      this.getBounding();
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
    this.transitioning = true; // We destroy the class instance in the global onLeave function

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
