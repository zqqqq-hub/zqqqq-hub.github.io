(function () {
  const data = window.siteData;
  const pageType = document.body.dataset.page || "home";
  const isDetailPage = pageType === "detail";
  const rootPrefix = isDetailPage ? "../" : "";

  if (!data) return;

  const asset = (path) => {
    if (!path) return "";
    if (/^(https?:|mailto:|tel:)/.test(path)) return path;
    return rootPrefix + path;
  };

  const navHref = (anchor) => (isDetailPage ? `${rootPrefix}index.html${anchor}` : anchor);

  const html = {
    escape(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
    attrs(value) {
      return this.escape(value);
    },
  };

  function renderHeader() {
    return `
      <header class="site-header" aria-label="网站导航">
        <a class="brand" href="${navHref("#top")}" aria-label="回到首页">
          <span class="brand-text">张千</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav" data-nav-toggle>菜单</button>
        <nav class="site-nav" id="siteNav" aria-label="主导航" data-site-nav>
          <a href="${navHref("#works")}">作品</a>
          <a href="${navHref("#about")}">关于</a>
          <a href="${navHref("#resume")}">简历</a>
        </nav>
      </header>
    `;
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <span>${data.profile.name} · Visual Designer</span>
        <a href="${navHref("#top")}">回到顶部</a>
      </footer>
    `;
  }

  function workUrl(work) {
    return `${rootPrefix}works/${work.slug}.html`;
  }

  function orderedWorks() {
    return data.works
      .filter((work) => work.showOnHome === true)
      .sort((a, b) => a.displayPriority - b.displayPriority);
  }

  function workBySlug(slug) {
    return data.works.find((work) => work.slug === slug);
  }

  function fallbackAttr(path) {
    return path ? ` data-fallback-src="${html.attrs(asset(path))}"` : "";
  }

  function renderArrowFillButton({ text, href, className = "", target = "", rel = "", attrs = "" }) {
    const targetAttr = target ? ` target="${html.attrs(target)}"` : "";
    const relAttr = rel ? ` rel="${html.attrs(rel)}"` : "";
    return `
      <a class="arrow-fill-button ${html.attrs(className)}" href="${html.attrs(href)}"${targetAttr}${relAttr}${attrs ? ` ${attrs}` : ""}>
        <span class="arrow-fill-button-label">${html.escape(text)}</span>
        <span class="arrow-fill-button-icon" aria-hidden="true">
          <svg class="arrow-fill-button-arrow arrow-fill-button-arrow-enter" viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <svg class="arrow-fill-button-arrow arrow-fill-button-arrow-leave" viewBox="0 0 24 24" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </a>
    `;
  }

  function renderDetailNavigation(work) {
    const works = orderedWorks();
    const currentIndex = works.findIndex((item) => item.slug === work.slug);
    const backLink = `<a class="detail-project-index" href="${rootPrefix}index.html#works">返回项目列表</a>`;

    if (currentIndex < 0) {
      return `<nav class="detail-project-navigation is-single" aria-label="作品详情导航">${backLink}</nav>`;
    }

    const previous = works[currentIndex - 1];
    const next = works[currentIndex + 1];
    const previousLink = previous
      ? `<a class="detail-project-direction is-previous" href="${workUrl(previous)}"><span>上一个项目</span><strong>${previous.title}</strong></a>`
      : `<span class="detail-project-direction is-empty" aria-hidden="true"></span>`;
    const nextLink = next
      ? `<a class="detail-project-direction is-next" href="${workUrl(next)}"><span>下一个项目</span><strong>${next.title}</strong></a>`
      : `<span class="detail-project-direction is-empty" aria-hidden="true"></span>`;

    return `
      <nav class="detail-project-navigation" aria-label="作品详情导航" data-motion-reveal>
        ${previousLink}
        ${backLink}
        ${nextLink}
      </nav>
    `;
  }

  function renderHero() {
    const tools = [
      ["photoshop", "Adobe Photoshop"],
      ["codex", "Codex"],
      ["illustrator", "Adobe Illustrator"],
      ["jimeng", "即梦 AI"],
      ["indesign", "Adobe InDesign"],
      ["premiere", "Adobe Premiere Pro"],
      ["xiaohongshu", "小红书"],
      ["jianying", "剪映"],
      ["wechat", "微信"],
      ["amazon", "亚马逊"],
      ["douyin", "抖音"],
      ["blender", "Blender（基础使用）"],
      ["obsidian", "Obsidian"],
    ];
    const icons = tools.map(([slug, label], index) => {
      const isXiaohongshu = slug === "xiaohongshu";
      const tag = isXiaohongshu ? "a" : "div";
      const linkAttrs = isXiaohongshu
        ? ` href="${html.attrs(data.personalPractice.href)}" target="_blank" rel="noreferrer" aria-label="查看我的小红书主页"`
        : "";
      return `
      <${tag} class="floating-tool floating-tool-${slug}" role="listitem" title="${label}"${linkAttrs}
        style="--tool-index: ${index}; --tool-tilt: ${[-6, 4, 8, -3, 5, -8, -4, 7, -5, 3, -7, 6][index]}deg; --float-delay: ${-index * 1.73}s; --float-duration: ${5 + ((index * 1.37) % 5)}s">
        <div class="floating-tool-repel">
          <div class="floating-tool-enter">
            <div class="floating-tool-card">
              <img src="assets/hero-icons/${slug}.svg" alt="${label}" width="40" height="40" draggable="false">
            </div>
          </div>
        </div>
      </${tag}>`;
    }).join("");
    return `
      <section class="floating-hero" id="top" aria-labelledby="hero-title" data-motion-hero>
        <div class="floating-hero-tools" role="list" aria-label="我的创作工具与相关平台">
          ${icons}
        </div>
        <div class="floating-hero-copy">
          <p class="floating-hero-kicker" data-motion-reveal>ZHANG QIAN / VISUAL DESIGNER</p>
          <h1 id="hero-title" data-motion-reveal><span>${data.profile.name}</span><span class="floating-hero-divider" aria-hidden="true">·</span><span>商业视觉设计师</span></h1>
          <p class="floating-hero-intro" data-motion-reveal>围绕品牌、零售与产品内容，<br>用设计与 AI，把想法变成看得见的作品。</p>
          ${renderArrowFillButton({ text: "浏览作品", href: "#works", className: "floating-hero-cta", attrs: "data-motion-reveal" })}
        </div>
        <p class="floating-hero-footnote">HANGZHOU, CHINA <span aria-hidden="true">/</span> PORTFOLIO 2026</p>
      </section>
    `;
  }

  function renderAbout() {
    const experience = (data.resume.experience || [])
      .slice(0, 2)
      .map(
        (item) => `
          <article class="resume-tail-experience-item">
            <span class="resume-tail-period">${item.period || ""}</span>
            <div class="resume-tail-role">
              <strong>${item.company}</strong>
              <span>${item.role}</span>
            </div>
            <p>${item.description || ""}</p>
          </article>
        `,
      )
      .join("");

    return `
      <section class="resume-tail reveal-block" id="about" aria-labelledby="about-title">
        <div class="resume-tail-heading">
          <p class="section-kicker">About / Resume</p>
          <h2 id="about-title"><span>关于我</span></h2>
          <p>${data.profile.aboutText}</p>
        </div>
        <div class="resume-tail-detail" id="resume">
          <div class="resume-tail-section-label">Experience</div>
          <div class="resume-tail-experience-list" aria-label="工作经历摘要">
            ${experience}
          </div>
          <div class="resume-tail-meta">
            <div class="resume-tail-education">
              <span>Education</span>
              <strong>${data.resume.education}</strong>
              <p>${data.resume.educationDetail || ""}</p>
            </div>
            <div class="resume-tail-contact">
              <span>Contact</span>
              ${data.resume.contactFacts
                .map(
                  (fact) => `<a href="${fact.href}">${fact.value}</a>`,
                )
                .join("")}
            </div>
            ${renderArrowFillButton({
              text: "查看完整简历",
              href: asset(data.documents.resume),
              className: "resume-tail-document",
              target: "_blank",
              rel: "noreferrer",
              attrs: 'aria-label="查看完整简历 PDF，共 3 页"',
            })}
          </div>
        </div>
      </section>
    `;
  }

  function renderWorks() {
    const works = orderedWorks();
    const cards = works
      .map(
        (work, index) => `
          <article class="project-index-card project-index-card-${html.attrs(work.slug)} reveal" data-motion-reveal>
            <a href="${workUrl(work)}" aria-label="查看 ${html.attrs(work.title)} 项目详情">
              <div class="project-index-media">
                <img
                  src="${asset(work.cover)}"
                  alt="${html.attrs(work.title)} 项目封面"
                  loading="${index === 0 ? "eager" : "lazy"}"
                  ${fallbackAttr(work.coverFallback)}
                >
              </div>
              <div class="project-index-copy">
                <div>
                  <p>${work.category}</p>
                  <h3>${work.title}</h3>
                </div>
                <span>${work.year}</span>
              </div>
              <p class="project-index-role">${work.roleSummary}</p>
            </a>
          </article>
        `,
      )
      .join("");

    return `
      <section class="project-index" id="works" aria-labelledby="works-title">
        <div class="project-index-heading" data-motion-reveal>
          <div>
            <p class="section-kicker">Selected Casework / 01—${String(works.length).padStart(2, "0")}</p>
            <h2 id="works-title">项目案例</h2>
          </div>
          <p>这里展示我参与的品牌、零售与产品视觉项目。点击项目，查看完整案例与设计过程。</p>
        </div>
        <div class="project-index-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  function renderPersonalPractice() {
    const practice = data.personalPractice;
    if (!practice) return "";
    const images = practice.images
      .map(
        (image, index) => `
          <figure class="personal-practice-image personal-practice-image-${index + 1}">
            <img src="${asset(image.src)}" alt="${html.attrs(image.alt)}" loading="lazy">
          </figure>
        `,
      )
      .join("");
    const action = practice.href
      ? renderArrowFillButton({ text: "查看小红书创作", href: practice.href, className: "personal-practice-link", target: "_blank", rel: "noreferrer" })
      : `<span class="personal-practice-link is-pending" aria-disabled="true">查看小红书创作 <span aria-hidden="true">↗</span></span>`;

    return `
      <section class="personal-practice reveal-block" id="practice" aria-labelledby="practice-title">
        <div class="personal-practice-copy" data-motion-reveal>
          <p class="section-kicker">${practice.kicker}</p>
          <h2 id="practice-title">${practice.title}</h2>
          <p>${practice.description}</p>
          <div class="personal-practice-meta">
            <span class="personal-practice-account">${practice.handle}</span>
            ${action}
          </div>
        </div>
        <div class="personal-practice-gallery" aria-label="小红书个人视觉创作选图" data-motion-reveal>
          ${images}
        </div>
      </section>
    `;
  }

  function renderStoryFigure(image, index, wide = false) {
    return `
      <figure class="story-figure reveal ${wide ? "story-figure-wide" : ""}">
        <button type="button" data-lightbox-src="${asset(image.src)}" data-lightbox-alt="${html.attrs(image.alt)}">
          <img src="${asset(image.src)}" alt="${html.attrs(image.alt)}" loading="${index < 2 ? "eager" : "lazy"}"${fallbackAttr(image.fallback)}>
        </button>
        <figcaption>${image.caption || ""}</figcaption>
      </figure>
    `;
  }

  function renderContinuousBoardsPage(work) {
    const boards = work.continuousBoards
      .map(
        (board, index) => `
          <figure class="continuous-board" data-board-id="${html.attrs(board.id)}">
            <img
              src="${asset(board.src)}"
              alt="${html.attrs(board.alt)}"
              ${board.width && board.height ? `width="${board.width}" height="${board.height}"` : ""}
              loading="${index === 0 ? "eager" : "lazy"}"
            >
          </figure>
        `,
      )
      .join("");

    return `
      ${renderHeader()}
      <main class="detail-main continuous-case-main" data-case-layout="${html.attrs(work.slug)}">
        <div class="continuous-case-top">
          <a class="back-link" href="${rootPrefix}index.html#works">返回作品列表</a>
        </div>
        <section class="continuous-boards" aria-label="${html.attrs(work.title)} 连续画板">
          ${boards}
        </section>
        ${work.processNote ? `
          <section class="case-process-note" aria-label="AI 辅助制作说明">
            <p class="case-process-kicker">PROCESS / AI-ASSISTED VISUAL DEVELOPMENT</p>
            <h2>${html.escape(work.processNote.title)}</h2>
            <p>${html.escape(work.processNote.body)}</p>
            <p>${html.escape(work.processNote.detail)}</p>
          </section>
        ` : ""}
        ${renderDetailNavigation(work)}
      </main>
      ${renderFooter()}
    `;
  }

  function renderVisualStoryPage(work, tags) {
    const heroImage = work.storyHero || work.images[0];
    const storySections = (work.visualStory || [])
      .map(
        (section) => `
          <section class="story-section reveal-block">
            <div class="story-copy">
              <span>${section.kicker}</span>
              <h2>${section.title}</h2>
              <p>${section.body}</p>
            </div>
            <div class="story-visual-grid">
              ${section.images.map((image, index) => renderStoryFigure(image, index, index === 0)).join("")}
            </div>
          </section>
        `,
      )
      .join("");
    const pathItems = (work.decisionPath || [])
      .map(
        (item) => `
          <li>
            <strong>${item.label}</strong>
            <span>${item.note}</span>
          </li>
        `,
      )
      .join("");
    const feelings = (work.decisionFeelings || []).map((item) => `<span>${item}</span>`).join("");
    const library = work.systemLibrary
      ? `
        <section class="story-system reveal-block">
          <div class="story-copy">
            <span>05 / 系统沉淀</span>
            <h2>${work.systemLibrary.title}</h2>
            <p>${work.systemLibrary.body}</p>
            <div class="story-field-tags">
              ${work.systemLibrary.fields.map((field) => `<span>${field}</span>`).join("")}
            </div>
          </div>
          <div class="story-system-media">
            ${renderStoryFigure(work.systemLibrary.image, 0, true)}
          </div>
        </section>
      `
      : "";
    const scopeTags = (work.scopeTags || []).map((tag) => `<span>${tag}</span>`).join("");

    return `
      ${renderHeader()}
      <main class="detail-main story-main">
        <section class="detail-hero story-hero" data-motion-reveal>
          <a class="back-link" href="${rootPrefix}index.html#works">返回作品列表</a>
          <div class="detail-meta">
            <span>${work.category}</span>
            <span>${work.pageRange}</span>
          </div>
          <h1>${work.title}</h1>
          <p class="detail-english">${work.englishTitle}</p>
          <p>${work.longDescription}</p>
          <div class="detail-tags">${tags}</div>
          <div class="story-hero-visual">
            ${renderStoryFigure(heroImage, 0, true)}
          </div>
        </section>
        ${storySections}
        <section class="story-method reveal-block">
          <div class="story-copy">
            <span>04 / 决策路径</span>
            <h2>让用户从看见到行动</h2>
            <p>这套视觉系统不只解决画面呈现，也围绕用户决策过程组织信息：先让用户看懂，再帮助选择、建立信任，并推动购买、入会或复购。</p>
          </div>
          <ol class="decision-path">${pathItems}</ol>
          <div class="story-feelings">${feelings}</div>
        </section>
        ${library}
        <section class="story-scope reveal-block">
          <p class="eyebrow">My Role</p>
          <h2>我的工作价值</h2>
          <div class="story-scope-tags">${scopeTags}</div>
        </section>
        ${renderDetailNavigation(work)}
      </main>
      ${renderFooter()}
    `;
  }

  function renderHome() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
      ${renderHeader()}
      <main>
        ${renderHero()}
        ${renderWorks()}
        ${renderPersonalPractice()}
        ${renderAbout()}
      </main>
      ${renderFooter()}
    `;
  }

  function renderDetailPage() {
    const mount = document.getElementById("work-detail");
    if (!mount) return;

    const slug = mount.dataset.workSlug;
    const work = data.works.find((item) => item.slug === slug)
      || (slug === "supporting-projects" ? data.supportingProjectsDetail : null);

    if (!work) {
      mount.innerHTML = `
        ${renderHeader()}
        <main class="detail-main">
          <section class="detail-hero">
            <p class="eyebrow">Work Not Found</p>
            <h1>未找到作品</h1>
            <a class="button button-dark" href="${rootPrefix}index.html#works">返回作品列表</a>
          </section>
        </main>
      `;
      return;
    }

    document.title = `${work.title} · 张千作品集`;

    const tags = work.tags.map((tag) => `<span>${tag}</span>`).join("");
    if (work.continuousBoards) {
      mount.innerHTML = renderContinuousBoardsPage(work);
      return;
    }
    if (work.visualStory) {
      mount.innerHTML = renderVisualStoryPage(work, tags);
      return;
    }

    const caseStudy = (work.caseStudy || [])
      .map(
        (item) => `
          <article class="case-study-item reveal">
            <span>${item.title}</span>
            <p>${item.body}</p>
          </article>
        `,
      )
      .join("");
    const relatedWorks = (work.relatedWorks || [])
      .map((relatedSlug) => workBySlug(relatedSlug))
      .filter(Boolean)
      .map((relatedWork) => `<a href="${workUrl(relatedWork)}">${relatedWork.title}</a>`)
      .join("");
    const gallery = work.images
      .map(
        (image, index) => `
          <figure class="detail-figure reveal ${index === 0 ? "detail-figure-wide" : ""}">
            <button type="button" data-lightbox-src="${asset(image.src)}" data-lightbox-alt="${html.attrs(image.alt)}">
              <img src="${asset(image.src)}" alt="${html.attrs(image.alt)}" loading="${index < 2 ? "eager" : "lazy"}"${fallbackAttr(image.fallback)}>
            </button>
            <figcaption>${image.caption || work.title}</figcaption>
          </figure>
        `,
      )
      .join("");

    mount.innerHTML = `
      ${renderHeader()}
      <main class="detail-main">
        <section class="detail-hero" data-motion-reveal>
          <a class="back-link" href="${rootPrefix}index.html#works">返回作品列表</a>
          <div class="detail-meta">
            <span>${work.category}</span>
            <span>${work.pageRange}</span>
          </div>
          <h1>${work.title}</h1>
          <p class="detail-english">${work.englishTitle}</p>
          <p>${work.longDescription}</p>
          <div class="detail-tags">${tags}</div>
        </section>
        ${
          caseStudy
            ? `<section class="case-study" aria-label="${html.attrs(work.title)} 项目复盘">${caseStudy}</section>`
            : ""
        }
        ${
          relatedWorks
            ? `
              <section class="detail-related reveal" aria-label="${html.attrs(work.title)} 相关项目">
                <p class="eyebrow">Related Projects</p>
                <div class="supporting-links detail-related-links">${relatedWorks}</div>
              </section>
            `
            : ""
        }
        <section class="detail-gallery" aria-label="${html.attrs(work.title)} 图片">
          ${gallery}
        </section>
        ${renderDetailNavigation(work)}
      </main>
      ${renderFooter()}
    `;
  }

  function installModals() {
    if (document.getElementById("wechatModal")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="modal" id="wechatModal" aria-hidden="true">
          <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="wechat-title">
            <button class="modal-close" type="button" data-close-modal aria-label="关闭">×</button>
            <p class="eyebrow">Wechat</p>
            <h2 id="wechat-title">微信联系</h2>
            <div class="qr-frame">
              <img src="${asset(data.contact.wechatQr)}" alt="张千微信二维码" data-wechat-qr>
              <div class="qr-missing" data-wechat-missing aria-hidden="true">
                <strong>二维码待补充</strong>
                <span>上线前将真实图片放入 assets/contact/wechat-qr.png</span>
              </div>
            </div>
            <p>如果二维码暂未显示，可以先通过邮箱联系：<span>${data.contact.email}</span></p>
          </div>
        </div>
        <div class="modal lightbox" id="imageLightbox" aria-hidden="true">
          <div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="作品图片预览">
            <button class="modal-close" type="button" data-close-modal aria-label="关闭">×</button>
            <img alt="">
          </div>
        </div>
      `,
    );
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
  }

  function closeModals() {
    document.querySelectorAll(".modal.is-open").forEach((modal) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("has-modal");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const navToggle = event.target.closest("[data-nav-toggle]");
      if (navToggle) {
        const nav = document.querySelector("[data-site-nav]");
        const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
        navToggle.setAttribute("aria-expanded", String(isOpen));
        nav?.classList.toggle("is-open", isOpen);
        document.body.classList.toggle("has-open-nav", isOpen);
        return;
      }

      if (event.target.closest("[data-site-nav] a")) {
        const toggle = document.querySelector("[data-nav-toggle]");
        document.querySelector("[data-site-nav]")?.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("has-open-nav");
      }

      const wechatTrigger = event.target.closest("[data-open-wechat]");
      if (wechatTrigger) {
        const qrImage = document.querySelector("[data-wechat-qr]");
        const missingState = document.querySelector("[data-wechat-missing]");
        if (qrImage && missingState) {
          qrImage.hidden = false;
          missingState.setAttribute("aria-hidden", "true");
          qrImage.onerror = () => {
            qrImage.hidden = true;
            missingState.removeAttribute("aria-hidden");
          };
          if (qrImage.complete && qrImage.naturalWidth === 0) {
            qrImage.hidden = true;
            missingState.removeAttribute("aria-hidden");
          }
        }
        openModal("wechatModal");
        return;
      }

      const closeTrigger = event.target.closest("[data-close-modal]");
      if (closeTrigger || event.target.classList.contains("modal")) {
        closeModals();
        return;
      }

      const lightboxTrigger = event.target.closest("[data-lightbox-src]");
      if (lightboxTrigger) {
        const modal = document.getElementById("imageLightbox");
        const image = modal.querySelector("img");
        const renderedImage = lightboxTrigger.querySelector("img");
        image.src = renderedImage?.currentSrc || lightboxTrigger.dataset.lightboxSrc;
        image.alt = lightboxTrigger.dataset.lightboxAlt || "";
        openModal("imageLightbox");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModals();
        const navToggle = document.querySelector("[data-nav-toggle]");
        const nav = document.querySelector("[data-site-nav]");
        const wasOpen = nav?.classList.contains("is-open");
        nav?.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("has-open-nav");
        if (wasOpen) navToggle?.focus();
      }
    });
  }

  function installImageFallbacks() {
    document.querySelectorAll("img[data-fallback-src]").forEach((image) => {
      const swapToFallback = () => {
        const fallback = image.dataset.fallbackSrc;
        if (!fallback || image.src === fallback) return;
        image.src = fallback;
        image.removeAttribute("data-fallback-src");
      };

      image.addEventListener("error", swapToFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) swapToFallback();
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal, .reveal-block");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    items.forEach((item) => observer.observe(item));
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (isDetailPage) renderDetailPage();
    else renderHome();
    installModals();
    installImageFallbacks();
    bindEvents();
    initReveal();
  });
})();
