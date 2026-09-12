const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

const projectList = document.querySelector('#project-list');
const projectStatus = document.querySelector('#project-status');
const retryButton = document.querySelector('#retry-button');

const GITHUB_USERNAME = 'piwoori';

/* =========================
   Application State
========================= */
const STATE = {
  projects: [],
  projectStatus: 'idle'
};

/* =========================
   Project Rendering
========================= */
// 구조 분해 할당

const renderProjects = (projects) => {
  projectList.innerHTML = projects
    .map((project) => {
      const {
        name,
        description,
        html_url,
        language,
        stargazers_count
      } = project;

      return `
        <article class="project-card">
          <h3>${name}</h3>
          <p>${description ?? '프로젝트 설명이 없습니다.'}</p>
          <p>Language: ${language ?? 'Unknown'}</p>
          <p>Stars: ${stargazers_count}</p>
          <a
            href="${html_url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub 보기
          </a>
        </article>
      `;
    })
    .join('');
};

const renderProjectState = () => {
  projectList.innerHTML = '';
  retryButton.classList.remove('visible');

  if (STATE.projectStatus === 'loading') {
    projectStatus.textContent = '프로젝트를 불러오는 중...';
    return;
  }

  if (STATE.projectStatus === 'error') {
    projectStatus.textContent = '프로젝트를 불러올 수 없습니다.';
    retryButton.classList.add('visible');
    return;
  }

  if (STATE.projectStatus === 'empty') {
    projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    return;
  }

  if (STATE.projectStatus === 'success') {
    projectStatus.textContent = '';
    renderProjects(STATE.projects);
  }
};

/* =========================
   GitHub API
========================= */
const loadProjects = async () => {
  STATE.projectStatus = 'loading';
  renderProjectState();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API 요청 실패: ${response.status}`
      );
    }

    const projects = await response.json();

    const filteredProjects = projects.filter(
      (project) => !project.fork
    );

    STATE.projects = filteredProjects;

    STATE.projectStatus =
      STATE.projects.length === 0
        ? 'empty'
        : 'success';

    renderProjectState();
  } catch (error) {
    STATE.projects = [];
    STATE.projectStatus = 'error';
    STATE.errorMessage = error.message;

    renderProjectState();

    console.error('GitHub API Error:', error);
  }
};

retryButton.addEventListener('click', loadProjects);

loadProjects();

/* =========================
   Mobile Navigation
========================= */
menuToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('active');

  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.setAttribute(
    'aria-label',
    isOpen ? '메뉴 닫기' : '메뉴 열기' 
  );

  menuToggle.textContent = isOpen ? '✕' : '☰';
});

const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    targetSection.scrollIntoView({
      behavior: 'smooth'
    });

    navMenu.classList.remove('active');

    menuToggle.setAttribute(
      'aria-expanded',
      'false'
    );

    menuToggle.setAttribute(
      'aria-label',
      '메뉴 열기'
    );

    menuToggle.textContent = '☰';
  });
});

/* =========================
   Theme
========================= */
const themeToggle =
  document.querySelector('#theme-toggle');

const savedTheme =
  localStorage.getItem('theme');

if (savedTheme) {
  document.documentElement.setAttribute(
    'data-theme',
    savedTheme
  );

  themeToggle.textContent =
    savedTheme === 'dark'
      ? '☀️'
      : '🌙';
}

themeToggle.addEventListener('click', () => {
  const currentTheme =
    document.documentElement.getAttribute(
      'data-theme'
    );

  const newTheme = currentTheme === 'dark'? 'light' : 'dark';

  document.documentElement.setAttribute(
    'data-theme',
    newTheme
  );

  localStorage.setItem(
    'theme',
    newTheme
  );

  themeToggle.textContent =
    newTheme === 'dark' ? '☀️' : '🌙';

});

/* =========================
   Scroll
========================= */
const header =
  document.querySelector('.header');

const scrollTopButton =
  document.querySelector('#scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY >= 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (window.scrollY >= 300) {
    scrollTopButton.classList.add('active');
  } else {
    scrollTopButton.classList.remove('active');
  }
});

scrollTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

/* =========================
   Scroll Animation
========================= */
const revealElements =
  document.querySelectorAll('.reveal');

const revealObserver =
  new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2
    }
  );

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================
   Contact Form
========================= */
const contactForm =
  document.querySelector('#contact-form');

const nameInput =
  document.querySelector('#name');

const emailInput =
  document.querySelector('#email');

const messageInput =
  document.querySelector('#message');

const nameError =
  document.querySelector('#name-error');

const emailError =
  document.querySelector('#email-error');

const messageError =
  document.querySelector('#message-error');

const formSuccess =
  document.querySelector('#form-success');

const isValidEmail = (email) => {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
};

const validateForm = () => {
  let isValid = true;

  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';

  if (nameInput.value.trim() === '') {
    nameError.textContent =
      '이름을 입력해주세요.';

    isValid = false;
  }

  if (emailInput.value.trim() === '') {
    emailError.textContent =
      '이메일을 입력해주세요.';

    isValid = false;
  } else if (
    !isValidEmail(emailInput.value.trim())
  ) {
    emailError.textContent =
      '올바른 이메일 형식을 입력해주세요.';

    isValid = false;
  }

  if (messageInput.value.trim() === '') {
    messageError.textContent =
      '메시지를 입력해주세요.';

    isValid = false;
  }

  return isValid;
};

contactForm.addEventListener(
  'submit',
  (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    formSuccess.textContent =
      '메시지가 정상적으로 작성되었습니다.';

    contactForm.reset();
  }
);

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim() === '') {
    nameError.textContent = '이름을 입력해주세요.';
  } else {
    nameError.textContent = '';
  }
});

emailInput.addEventListener('input', () => {
  const email =
    emailInput.value.trim();

  if (email === '') {
    emailError.textContent =
      '이메일을 입력해주세요.';
  } else if (!isValidEmail(email)) {
    emailError.textContent =
      '올바른 이메일 형식을 입력해주세요.';
  } else {
    emailError.textContent = '';
  }
});

messageInput.addEventListener('input', () => {
  if (messageInput.value.trim() === '') {
    messageError.textContent = '메시지를 입력해주세요.';
  } else {
    messageError.textContent = '';
  }
});