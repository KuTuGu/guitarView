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
  let reverseArr = null;
  const goods = document.getElementsByClassName('good');
  const switchOff = document.getElementsByClassName('switch');
  const topMask = document.getElementsByClassName('topMask')[0];
  const transition = 'transform 0.5s ease-in-out';

  Array.from(goods).forEach(dom => {
    const [ img, mask ] = dom.children[0].children;
    const [ title, desc, detail ] = dom.children[1].children;
    const animations = [
      // 注意可能存在顺序前后影响
      FLIPAnimation(desc, 'descExpanded'),
      FLIPAnimation(detail, 'detailExpanded'),
      FLIPAnimation(title, 'titleExpanded'),
      FLIPAnimation(mask, 'maskExpanded'),
      FLIPAnimation(img, 'goodPicExpanded'),
      FLIPAnimation(topMask, 'topMaskExpanded'),
      FLIPAnimation(switchOff[0], 'hide'),
      FLIPAnimation(switchOff[1], 'show')
    ];

    dom.addEventListener('click', () => {
      if (!isExpanded) {
        isExpanded = true;
        
        animations.forEach(animate => animate(transition));

        reverseArr = animations;
      }
    })
  })

  switchOff[1].addEventListener('click', () => {
    if (isExpanded) {
      isExpanded = false;
      
      reverseArr.forEach(clearAnimation => clearAnimation(transition));
    }
  })
}