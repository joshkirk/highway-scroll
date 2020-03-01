##### [Sandbox](https://highway-scroll.joshkirk.dev/)

## Localhost Setup
1. From the project root in terminal, run NPM install
2. To start the project now, setup your watch: `npm run watch-dev` or `npm run watch` to minimize for prod builds
3. In the terminal, navigate to `web/site` and then type `php -S localhost:8000` to start your virtual server, 
or point MAMP to the `web/site` directory



## Core performance principles

1. Avoid network requests during animations whenever possible. Load images as blobs with web workers, prefetch priority pages on doc ready when the thread is idle, etc
2. Never autoplay videos. Use the scroll anims library to play/pause/restart them when in/out of view. See `playPauseVideos()` in the scroll based anims class. 
3. Taking scroll measurements should be done only once (and on resize). Notice the order of image loading & function calls in `/js/_global/_renderer` `globalEvents` function.
There is a reason the preload-critical image workers are fired, and when those + the lead-in transition (either initial or PJAX transition) is complete, we take the scroll
measurements. It's a balance of waiting for unavoidable network requests to be finished, for animations to be finished, etc.. and then instantiating the scroll based anims.
The actual class call and all calculations are very fast, but can cause dropped frames if you fire it too soon during your transitions.  
4. Take all animation measurements once (lots of BCR calls) when the class is instantiated, never on the fly in the animation loop. Avoid anything else that might cause a document reflow 
such as adding/removing class names, querying an element's offsetHeight, etc. [What causes layout/reflow](https://gist.github.com/paulirish/5d52fb081b3570c81e3a).  
5. Hyper optimize anything that fires in RAF. Use for loops with cached length values instead of .forEach (~8x faster), never check or set anything that doesn't need to be 
checked/set (use flags).
6. All media should have it's an intrinsic height set, except for elements whose height do not affect document flow. With the goal of only taking our animation measurements once,
plus not waiting for all images to do so, it's critical that all images somehow have a height in the CSS. Consider using an `.ar-wrapper` container to set the aspect ratio with padding bottom
and positioning the media absolutely within.


## PJAX specifics

1. Pacing is everything. It's not about what is actually happening, it's about what the user perceives to be happening. With highway we have total freedom during transitions & page renderers to pace things as needed.
2. Store important elements, timeline references, measurements etc in globalStorage objects (see `/js/_global/storage.js`). When moving between pages, you will often need to reverse a global timeline, 
update the namespace, check measurement values, etc.
3. Know when certain aspects of your transitions are complete by modifying the above mentioned globalStorage values. This helps greatly with the pacing. Notice the setInterval 
in the critical images callback in the global renderer.

#### Advanced uses
1. By adding contextual transitions when instantiating highway in `/js/routing.js`, you can place `data-transition="transitionName"` to an anchor tag to use custom transitions on the fly.
The contextual transitions can also be used when calling a redirect programmatically, ie, `H.redirect(fullHref, transitionName)`
2. Often times contextual transitions are used in conjunction with a strategy called "overlapping transitions", whereby you strategically call `from.remove()` in the transition when you know
the next page's elements are in position and loaded. In this way, you can create transitions that make certain elements appear to persist across views. For example, from the footer of one page
to the header of the next might have identical elements. By using a contextual transition to take you from the footer to the next page hero, and animating/timing your transition correctly, 
you can make those identical elements appear to have never changed when in reality they were replaced by the new elements.

## Scroll based anims class specifics
#### (See comments in file)
1. The scroll based animations file can be set with a flag to use either virtual scroll or the native window scrollY value. Regardless, mobile and Firefox use the native scrollY value.
2. There are more advanced usages, but basically the pattern will always be the same. Create a data collection function that gets bounding data, call it in `getCache()`, then create an 
animation function that animates against that data and call it in the `run()` function.
3. If you want to use native scroll, you'll have to set some body styles accordingly. See `/css/_critical/init.scss`. the `data-smooth` attributes on the page sections won't do anything if 
`this.isVS` is set to false.
 
#### Advanced uses
With the data available regardless of device, there's really nothing you can't do with the `ScrollBasedAnims` class. 
1. As you'll see with the hero and footer element animations, I like to use what I refer to as a measure elements (`.measure-el`). When nested inside of a section we want to animate 
and given a certain height & top positioning, these can be used to pan through more complicated timelines (what I sometimes refer to as scenes). The scene might be more complicated and the timeline created 
within the class instead of being extracted from the markup, but the core strategy remains the same. You collect the measure element bounding data so you can track it's progress, and you pan through 
a timeline based on that. Typically this involves animations that take place over several viewport heights.
2. Fixed positioning isn't as straight forward when using virtual scroll, but overall virtual scroll produces a better fixed position experience because we're animating the fixed element on every frame
and never swapping css position value from fixed to unfixed which can cause jumps. Basically the strategy is to set the css position to fixed, and at the bottom of the section that it remains fixed through, you
place a measure element (remember `.measure-el`) and as that element enters the viewport, transform the fixed position element up and out of view. See [this page](https://plenaire.co/products/remedy/), the `.measure-el` 
at the bottom of the `.right-content` in the first part of that page. I actually had to nudge that with JS because the left side collapses, but the point is as the measure element enters, the fixed element will scroll up
out of view and back down when scrolling up.
