# 📖 Flow Deep Dive Sprint

---

## 🛠️ 문제 상황

### 🧐 상황

북키위 팀의 다음 과제는 **이북 리더기 제작**이다.  
지난 EPUB 리서치 스프린트에서 **EPUB CFI**를 활용하면 공유 기능을 쉽게 추가할 수 있음을 확인했다.
[Epub 리서치 스프린트](https://plausible-windflower-bc3.notion.site/Epub-1b2be08797b4809a9401c3d54548219c)

따라서 **이북 리더기만 제대로 제작한다면** 서비스 확장이 가능하다.

### ❌ 문제

- 팀이 리더기 제작 경험이 전무하다.
- 어떻게 만들어야 할지 전혀 모른다.
- 만들어도 형편없는 결과물이 나올 가능성이 크다.

독서 경험을 더욱 즐겁게 만들어야 하는 서비스에서, **핵심이 되는 뷰어가 엉망이라면 말도 안 된다.**

### 💡 해결 아이디어

기존 오픈소스 이북 리더기 **"Flow"를 분석하는 "Flow Deep Dive Sprint"를 진행하자.**

---

## 🎯 스프린트 목표

### 📌 북키위의 목표

- **이북 리더기 개발 역량 확보**

  - EPUB CFI와 **epub.js 기반의 리더기 개발 원리**를 이해한다.
  - 기존 오픈소스 리더기(Flow)의 **구조와 구현 방식을 분석하여 벤치마킹**한다.

- **기술적 리스크 최소화 및 구현 방향 설정**
  - 개발 과정에서 발생할 수 있는 **기술적 장애물을 사전 파악**하고 해결 방안을 모색한다.
  - Flow 코드를 분석하여 **북키위 서비스에 적합한 기술 스택을 정리**한다.

---

### 📌 커리어 목표

- **우수한 개발자의 코드 분석을 통해 실력을 향상한다.**

  - 코딩 및 설계 역량 강화

- **기존 프로젝트의 코드 리딩 및 분석 역량을 키운다.**

  - 다양한 코드베이스를 빠르게 파악하고, 협업 및 코드 리뷰 능력을 성장시킨다.

- **이력서에 어필할 수 있는 경험을 쌓는다.**
  - 레포지토리 분석 경험을 포트폴리오에 추가
  - 오픈소스 기여 경험을 통한 문제 해결 능력 강조
  - 코드 리딩 및 분석 능력 강화
  - 레거시 코드 적응력 향상
  - 학습 열정과 능력 강조

## 🔍 How to deep dive

**레포지토리의 폴더, 파일, 코드의 역할을 주석으로 정리한다.**

## 🚀 성과

│── 📂 [.github](./deep-dive/.github/index.md) # GitHub 관련 설정 (FUNDING.yml)  
│── 📂 [.husky](./deep-dive/.husky/index.md) # Husky와 관련된 설정 파일들을 저장하는 디렉터리  
│── 📂 [.vscode](./deep-dive/.vscode/index.md) # VS Code 편집기 설정  
│── 📂 [apps](./deep-dive/apps/index.md) # 애플리케이션 소스 코드  
│── 📂 [packages](./deep-dive/packages/index.md) # 모노레포에서 공통 패키지 및 라이브러리  
│── 📄 [.dockerignore](./.dockerignore) # Docker 빌드 시 제외할 파일 목록  
│── 📄 [.eslintrc.js](./.eslintrc.js) # ESLint 설정 파일 (코드 스타일 검사)  
│── 📄 [.gitattributes](./.gitattributes) # Git 속성 설정 (CRLF 변환 등)  
│── 📄 [.gitignore](./.gitignore) # Git에서 추적하지 않을 파일 목록  
│── 📄 [.npmrc](./.npmrc) # npm 설정 파일 (프록시, 레지스트리 설정 등)  
│── 📄 [Dockerfile](./Dockerfile) # Docker 컨테이너 빌드 설정 파일  
│── 📄 [LICENSE](./LICENSE) # 프로젝트의 오픈소스 라이선스 정보  
│── 📄 [README.md](./README.md) # 프로젝트 개요 및 설명 문서  
│── 📄 [docker-compose.yml](./docker-compose.yml) # Docker Compose 설정 (멀티 컨테이너 관리)  
│── 📄 [package.json](./package.json) # npm 패키지 정보 및 의존성 목록  
│── 📄 [pnpm-lock.yaml](./pnpm-lock.yaml) # pnpm 패키지 매니저의 버전 잠금 파일  
│── 📄 [pnpm-workspace.yaml](./pnpm-workspace.yaml) # pnpm 모노레포 워크스페이스 설정  
│── 📄 [prettier.config.js](./prettier.config.js) # Prettier 코드 포맷팅 설정  
│── 📄 [tsconfig.json](./tsconfig.json) # TypeScript 기본 설정 파일  
│── 📄 [tsconfig.next.json](./tsconfig.next.json) # Next.js 프로젝트의 TypeScript 설정  
│── 📄 [tsconfig.react.json](./tsconfig.react.json) # React 프로젝트 전용 TypeScript 설정  
│── 📄 [tsconfig.ts.json](./tsconfig.ts.json) # TypeScript 설정 파일  
│── 📄 [turbo.json](./turbo.json) # TurboRepo 빌드 시스템 설정 파일 (모노레포)
