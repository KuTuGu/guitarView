/*
1.对goods监听click冒泡，直接处理good对应的dom节点
2.对全局监听click冒泡，需要在e.target绑定good信息，即good下所有可点击dom子节点都需要绑定good信息

两种方式需要均衡考虑，这里为了方便选择第一种监听方式
*/
window.onload = () => {
  let isExpanded = false;
  // 存储dom指针，避免频繁读取
  let goodRef = null;
  const goods = document.getElementsByClassName('good');
  const leftView = document.getElementById('leftView');
  const switchOff = document.getElementsByClassName('switch');
  const topMask = document.getElementsByClassName('topMask')[0];

  Array.from(goods).forEach(dom => {
    dom.addEventListener('click', () => {
      if (!isExpanded) {
        requestAnimationFrame(() => {
          isExpanded = true;
          const [ img, mask ] = dom.children[0].children;
          const [ title, desc, detail ] = dom.children[1].children;
          // 获取相对位置，遮罩进行相应偏移
          const { bottom } = mask.getBoundingClientRect();
          const left = leftView.contains(dom);
          
          img.classList.add('goodPicExpanded');
          // 偏移值需要js计算
          img.style.transform = `translate(
            ${left ? "45vw" : "-5vw"},
            ${window.innerHeight * 0.8 - bottom}px
          )`;

          topMask.classList.add('maskExpanded');
          mask.classList.add('maskExpanded');
          mask.style.transform = `translate(
            ${left ? "-5vw" : "-55vw"},
            ${window.innerHeight - bottom}px
          )`;

          switchOff[0].style.opacity = 0;
          switchOff[1].style.opacity = 1;

          title.classList.add("title-expanded");
          desc.classList.add("desc-expanded");
          detail.classList.add("detail-expanded");
          
          // 存储
          goodRef = dom;
        })
      }
    })
  })

  switchOff[1].addEventListener('click', () => {
    if (isExpanded) {
      requestAnimationFrame(() => {
        isExpanded = false;
        // 恢复原布局
        const [ img, mask ] = goodRef.children[0].children;
        const [ title, desc, detail ] = goodRef.children[1].children;

        title.classList.remove("title-expanded");
        desc.classList.remove("desc-expanded");
        detail.classList.remove("detail-expanded");
        
        img.classList.remove('goodPicExpanded');
        img.style.transform = 'translate(0, 0)';
  
        topMask.classList.remove('maskExpanded');
        mask.classList.remove('maskExpanded');
        mask.style.transform = 'translate(0, 0)';
  
        switchOff[0].style.opacity = 1;
        switchOff[1].style.opacity = 0;
      })
    }
  })
}