/**
 * FLIP动画函数，平滑动画，提升性能
 * @function FLIPAnimation
 * @param    { HTMLElement }  el             执行动画的具体dom节点
 * @param    { String }       lastClass      节点最终位置的类选择器
 * 
 * @return   { Function }     animate        动画执行函数
 */
function FLIPAnimation(el, lastClass) {
  // 获取节点初始样式
  const firstStyle = el.getBoundingClientRect();
  const firstOpacity = parseFloat(getComputedStyle(el).opacity);

  // 为节点指定样式，使其定位到最终位置
  el.classList.add(lastClass);
  // 获取节点最终位置
  const lastStyle = el.getBoundingClientRect();
  const lastOpacity = parseFloat(getComputedStyle(el).opacity);

  // 反转，恢复到初始样式
  const invert = {
    left: firstStyle.left - lastStyle.left,
    top: firstStyle.top - lastStyle.top,
    width: firstStyle.width / lastStyle.width,
    height: firstStyle.height / lastStyle.height
  };
  const invertTran = `
    translate(${invert.left}px, ${invert.top}px)
    scale(${invert.width}, ${invert.height})
  `;
  el.style.transformOrigin = '0 0';
  el.style.transform = invertTran;
  el.style.opacity = firstOpacity;

  // 返回动画函数
  let isReverse = false;
  return transition => {
    el.style.transition = transition || el.style.transition;

    if (isReverse) {
      isReverse = !isReverse;
      requestAnimationFrame(() => {
        el.style.transform = invertTran;
        el.style.opacity = firstOpacity;
      })
    } else {
      isReverse = !isReverse;
      requestAnimationFrame(() => {
        el.style.opacity = lastOpacity;
        el.style.transform = `translate(0, 0) scale(1, 1)`;
      })
    }
  }
}

/*
1.对goods监听click冒泡，直接处理good对应的dom节点
2.对全局监听click冒泡，需要在e.target绑定good信息，即good下所有可点击dom子节点都需要绑定good信息

两种方式需要均衡考虑，这里为了方便选择第一种监听方式
*/
window.onload = () => {
  let isExpanded = false;
  let domRef = null;
  const goodsArr = {};
  const globalArr = [];
  const goods = document.getElementsByClassName('good');
  const switchOff = document.getElementsByClassName('switch');
  const topMask = document.getElementsByClassName('topMask')[0];
  const transition = 'transform 0.5s ease-in-out';

  Array.from(goods).forEach((dom, index) => {
    dom.id = dom.id || index;
    dom.addEventListener('click', () => {
      if (!isExpanded) {
        isExpanded = true;

        const [ img, mask ] = dom.children[0].children;
        const [ title, desc, detail ] = dom.children[1].children;

        // 缓存货物动画函数，只需初始化一次
        if (!goodsArr[dom.id]) {
          // 因为存在动画后元素脱离文档流，导致父元素尺寸变化，影响布局。需要先特殊处理
          const size = dom.getBoundingClientRect();
          dom.style.width = `${size.width}px`;
          dom.style.height = `${size.height}px`;
          
          // FLIP动画初始化
          goodsArr[dom.id] = [
            // 顺序可能影响布局
            FLIPAnimation(desc, 'descExpanded'),
            FLIPAnimation(detail, 'detailExpanded'),
            FLIPAnimation(title, 'titleExpanded'),
            FLIPAnimation(mask, 'maskExpanded'),
            FLIPAnimation(img, 'goodPicExpanded')
          ];
        }

        // 全局单例，只需实例一次
        if (!globalArr.length) {
          globalArr.push(
            FLIPAnimation(topMask, 'topMaskExpanded'),
            FLIPAnimation(switchOff[0], 'hide'),
            FLIPAnimation(switchOff[1], 'show')
          );
        }

        // 特殊副作用处理
        img.style.zIndex = 30;
        mask.style.zIndex = 10;
        title.style.zIndex = 30;
        desc.style.zIndex = 30;
        detail.style.zIndex = 30;
        topMask.style.zIndex = 10;

        // FLIP动画
        goodsArr[dom.id].forEach(animate => animate(transition));
        globalArr.forEach(animate => animate(transition));
        
        domRef = dom;
      }
    })
  })

  switchOff[1].addEventListener('click', () => {
    if (isExpanded) {
      isExpanded = false;
      
      goodsArr[domRef.id].forEach(clearAnimation => clearAnimation(transition));
      globalArr.forEach(clearAnimation => clearAnimation(transition));

      // 特殊副作用处理
      const [ img, mask ] = domRef.children[0].children;
      const [ title, desc, detail ] = domRef.children[1].children;

      img.style.zIndex = 3;
      mask.style.zIndex = 1;
      title.style.zIndex = 1;
      desc.style.zIndex = 1;
      detail.style.zIndex = 1;
      topMask.style.zIndex = 1;
    }
  })
}