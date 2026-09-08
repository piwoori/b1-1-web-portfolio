const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const projectList = document.querySelector('#project-list');
const projectStatus = document.querySelector('#project-status');
const retryButton = document.querySelector('#retry-button');

const GITHUB_USERNAME = 'piwoori';

const renderProjects = (projects) => {
  if (projects.length === 0) {
    projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    projectList.innerHTML = '';
    return;
  }

  projectStatus.textContent = '';

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
          <a href="${html_url}" target="_blank" rel="noopener noreferrer">
            GitHub 보기
          </a>
        </article>
      `;
    })
    .join('');
};

const loadProjects = async () => {
  projectStatus.textContent = '프로젝트를 불러오는 중...';
  projectList.innerHTML = '';
  retryButton.style.display = 'none';

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos`
    );

    if (!response.ok) {
      throw new Error('GitHub API 요청 실패');
    }

    const projects = await response.json();

    renderProjects(projects);
  } catch (error) {
    projectStatus.textContent = '프로젝트를 불러올 수 없습니다.';
    retryButton.style.display = 'inline-block';

    console.error(error);
  }
};

retryButton.addEventListener('click', loadProjects);

loadProjects();

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

const themeToggle = document.querySelector('#theme-toggle');

const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.textContent =
    savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const currentTheme =
    document.documentElement.getAttribute('data-theme');

  const newTheme =
    currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);

  localStorage.setItem('theme', newTheme);

  themeToggle.textContent =
    newTheme === 'dark' ? '☀️' : '🌙';
});

const header = document.querySelector('.header');
const scrollTopButton = document.querySelector('#scroll-top');

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