/* =========================
   Constants
========================= */
const GITHUB_USERNAME = 'piwoori';

/* =========================
   DOM Elements
========================= */
// Navigation
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

// Theme
const themeToggle = document.querySelector('#theme-toggle');

// Projects
const projectList = document.querySelector('#project-list');
const projectStatus = document.querySelector('#project-status');
const projectFilters = document.querySelector('#project-filters');
const retryButton = document.querySelector('#retry-button');

// Scroll
const header = document.querySelector('.header');
const scrollTopButton = document.querySelector('#scroll-top');
const revealElements = document.querySelectorAll('.reveal');

// Contact Form
const contactForm = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const nameError = document.querySelector('#name-error');
const emailError = document.querySelector('#email-error');
const messageError = document.querySelector('#message-error');
const formSuccess = document.querySelector('#form-success');

/* =========================
   Application State
========================= */
const STATE = {
  projects: [],
  projectStatus: 'idle',
  errorMessage: ''
};

let allProjects = [];

/* =========================
   Project Functions
========================= */
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

const renderProjectFilters = (projects) => {
  const languages = [
    ...new Set(
      projects
        .map((project) => project.language)
        .filter((language) => language !== null)
    )
  ].sort();

  const filterOptions = ['all', ...languages];

  projectFilters.innerHTML = '';

  filterOptions.forEach((language, index) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'project-filter-button';
    button.textContent = language === 'all' ? '전체' : language;
    button.setAttribute('aria-pressed', String(index === 0));

    if (index === 0) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      const filterButtons = document.querySelectorAll(
        '.project-filter-button'
      );

      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove('active');
        filterButton.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      const filteredProjects =
        language === 'all'
          ? allProjects
          : allProjects.filter(
              (project) => project.language === language
            );

      renderProjects(filteredProjects);
    });

    projectFilters.appendChild(button);
  });
};

const renderProjectState = () => {
  projectList.innerHTML = '';
  retryButton.classList.remove('visible');

  if (STATE.projectStatus === 'loading') {
    projectFilters.innerHTML = '';
    projectStatus.textContent = '프로젝트를 불러오는 중...';
    return;
  }

  if (STATE.projectStatus === 'error') {
    projectFilters.innerHTML = '';
    projectStatus.textContent = '프로젝트를 불러올 수 없습니다.';
    retryButton.classList.add('visible');
    return;
  }

  if (STATE.projectStatus === 'empty') {
    projectFilters.innerHTML = '';
    projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    return;
  }

  if (STATE.projectStatus === 'success') {
    projectStatus.textContent = '';
    renderProjectFilters(STATE.projects);
    renderProjects(STATE.projects);
  }
};

const loadProjects = async () => {
  STATE.projectStatus = 'loading';
  STATE.errorMessage = '';

  renderProjectState();

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`
    );

    if (!response.ok) {
      throw new Error(`GitHub API 요청 실패: ${response.status}`);
    }

    const projects = await response.json();
    const filteredProjects = projects.filter(
      (project) => !project.fork
    );

    allProjects = filteredProjects;
    STATE.projects = filteredProjects;
    STATE.projectStatus =
      STATE.projects.length === 0 ? 'empty' : 'success';

    renderProjectState();
  } catch (error) {
    allProjects = [];
    STATE.projects = [];
    STATE.projectStatus = 'error';
    STATE.errorMessage = error.message;

    renderProjectState();
    console.error('GitHub API Error:', error);
  }
};

/* =========================
   Navigation Functions
========================= */
const closeMobileMenu = () => {
  navMenu.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
  menuToggle.textContent = '☰';
};

const toggleMobileMenu = () => {
  const isOpen = navMenu.classList.toggle('active');

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute(
    'aria-label',
    isOpen ? '메뉴 닫기' : '메뉴 열기'
  );
  menuToggle.textContent = isOpen ? '✕' : '☰';
};

const handleNavLinkClick = (event) => {
  event.preventDefault();

  const targetId = event.currentTarget.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  targetSection.scrollIntoView({
    behavior: 'smooth'
  });

  closeMobileMenu();
};

/* =========================
   Theme Functions
========================= */
const updateThemeButton = (theme) => {
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark'
      ? '라이트 모드로 전환'
      : '다크 모드로 전환'
  );
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (!savedTheme) {
    return;
  }

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute(
    'data-theme'
  );

  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
};

/* =========================
   Scroll Functions
========================= */
const handleScroll = () => {
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
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const revealObserver = new IntersectionObserver(
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

const initializeScrollAnimation = () => {
  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
};

/* =========================
   Contact Form Functions
========================= */
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const validateForm = () => {
  let isValid = true;

  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';

  if (nameInput.value.trim() === '') {
    nameError.textContent = '이름을 입력해주세요.';
    isValid = false;
  }

  if (emailInput.value.trim() === '') {
    emailError.textContent = '이메일을 입력해주세요.';
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
    isValid = false;
  }

  if (messageInput.value.trim() === '') {
    messageError.textContent = '메시지를 입력해주세요.';
    isValid = false;
  }

  return isValid;
};

const handleContactSubmit = (event) => {
  event.preventDefault();

  const isValid = validateForm();

  if (!isValid) {
    return;
  }

  formSuccess.textContent = '메시지가 정상적으로 작성되었습니다.';
  contactForm.reset();
};

const validateNameInput = () => {
  nameError.textContent =
    nameInput.value.trim() === '' ? '이름을 입력해주세요.' : '';
};

const validateEmailInput = () => {
  const email = emailInput.value.trim();

  if (email === '') {
    emailError.textContent = '이메일을 입력해주세요.';
  } else if (!isValidEmail(email)) {
    emailError.textContent = '올바른 이메일 형식을 입력해주세요.';
  } else {
    emailError.textContent = '';
  }
};

const validateMessageInput = () => {
  messageError.textContent =
    messageInput.value.trim() === '' ? '메시지를 입력해주세요.' : '';
};

/* =========================
   Event Listeners
========================= */
menuToggle.addEventListener('click', toggleMobileMenu);

navLinks.forEach((link) => {
  link.addEventListener('click', handleNavLinkClick);
});

themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('scroll', handleScroll);
scrollTopButton.addEventListener('click', scrollToTop);

retryButton.addEventListener('click', loadProjects);

contactForm.addEventListener('submit', handleContactSubmit);
nameInput.addEventListener('input', validateNameInput);
emailInput.addEventListener('input', validateEmailInput);
messageInput.addEventListener('input', validateMessageInput);

/* =========================
   Initialization
========================= */
initializeTheme();
initializeScrollAnimation();
loadProjects();