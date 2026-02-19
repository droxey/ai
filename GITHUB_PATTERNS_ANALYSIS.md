# GitHub Patterns Analysis: droxey

Deep analysis of github.com/droxey repositories and tech-at-DU commits.
Objective: identify what this Claude Code configuration is missing based on actual programming habits and writing style.

## Profile Summary

| Field | Value |
|-------|-------|
| Username | droxey (Dani Roxberry) |
| Active since | August 2010 (15+ years) |
| Public repos | 150 |
| Gists | 16 |
| Followers | 316 |
| Affiliation | @Tech-at-DU (Dominican University of California) |
| Role | Applied Computer Science faculty/instructor |

---

## Most Starred Repositories

| Rank | Repository | Stars | Language | Description |
|------|-----------|-------|----------|-------------|
| 1 | awesome-teachcode | 17 | HTML | Classroom resources, code review tools, tutorial/lesson plan aids |
| 2 | docker-django-react | 8 | Python | Dockerized PostgreSQL + Django/DRF + React boilerplate |
| 3 | OLD-auth-api-starterpack | 6 | JavaScript | Authenticated API starter for BEW 1.2 students |
| 4 | goslackit | 5 | Go | Starter Slackbot for BEW 2.5 goroutines challenge |
| 5 | tocsify | 5 | JavaScript | npm module to generate Docsify table of contents from directory structure |
| 6 | ml-xception | 4 | Python | Dog breed classifier using Flask + Keras |
| 7 | gopherology | 3 | Go | Go microservice: numerological Life Path number calculator |
| 8 | shoutouts.eth | 2 | JavaScript | Ethereum/Web3 project |
| 9 | awesome-go | 2 | Go | Fork of curated Go frameworks list |
| 10 | getpunk | 2 | Go | CLI/API for CryptoPunk information retrieval |

## Language Distribution (Across 150 Repos)

| Language | Repos | % |
|----------|-------|---|
| Go | 17 | 11.3% |
| Python | 15 | 10.0% |
| JavaScript | 15 | 10.0% |
| Shell | 8 | 5.3% |
| Dockerfile | 5 | 3.3% |
| CSS | 4 | 2.7% |
| C / C++ | 6 | 4.0% |
| HTML | 3 | 2.0% |
| No detected language | 24 | 16.0% |

## Recent Activity (2025-2026)

| Repository | Language | Focus |
|-----------|----------|-------|
| ai | JavaScript | This repo: Claude Code configuration |
| captainclaw | Jinja | Production OpenClaw deployment on CapRover Docker Swarm |
| graindl | Go | Grain asset downloader CLI |
| prompts | -- | System prompts for LLM chat (prompt engineering) |
| caprover-workadventure | Shell | WorkAdventure + CapRover deployment |
| caprover-workadventure-livekit | Shell | WorkAdventure with self-hosted LiveKit on CapRover |
| caprover-workadventure-jitsi | Shell | CapRover + WorkAdventure + Jitsi |

---

## tech-at-DU Organization Analysis

### Organization Profile

- **Full name**: Applied Computer Science @ Dominican University of California
- **Public repos**: 862
- **Created**: 2021-07-29 (migrated from Make School)
- **Primary content**: Course syllabi, lesson plans, tutorials, starter code, autograders

### droxey's Commit Footprint

| Metric | Value |
|--------|-------|
| Total commits (author) | 1,449 |
| Total commits (committer) | 1,077 |
| Distinct repositories touched | 40+ |
| Active period | August 2018 -- February 2026 (7.5 years) |
| Peak year | 2022 (215 commits in sample window) |

### Top Repositories by Commit Volume

| Commits | Repository | Primary Content |
|---------|-----------|----------------|
| 64 | ACS-1120-Intro-Data-Structures | Python data structures |
| 42 | ACS-3230-Web-Security | OWASP, encryption, incident response |
| 36 | ACS-4210-Strongly-Typed-Languages | Go (makesite, makescraper) |
| 31 | ACS-3110-Trees-Sorting | Binary trees, AVL, sorting algorithms |
| 31 | ACS-1111-Object-Oriented-Programming | Python OOP |
| 27 | Tweet-Generator | Python text generation tutorial |
| 27 | ACS-3220-Docker-DevOps-Deployments | Docker, CI/CD |
| 26 | ACS-1220-Authentication-and-Associations | Flask/Django auth |
| 19 | ACS-3240-Decentralized-Apps | Web3, Solidity, Ethereum |
| 17 | ACS-4931-Testing-and-Architecture | Python testing patterns |

### File Types Touched

| Type | Estimated % | Examples |
|------|------------|---------|
| Markdown (.md) | ~80% | Lesson plans, READMEs, syllabi, `_sidebar.md` |
| Python (.py) | ~10% | Data structures, autograders, tests |
| Shell (.sh) | ~4% | Build/deploy automation, autograder scripts |
| Config files | ~3% | requirements.txt, go.mod, Dockerfile, YAML |
| HTML (.html) | ~2% | Frontend tutorial content |
| Go (.go) | ~1% | Referenced via go.mod in course repos |

### Commit Message Style

Three distinct patterns observed:

**Pattern A: GitHub Web UI (60% of commits)**
Auto-generated messages from web editor:
- `Update RotatingTrees.md`
- `Create AVL-slides.md`
- `Delete Code/Procfile`
- `Rename VMResearch to VMResearch.md`
- `Add files via upload`

**Pattern B: Bracket-Prefix Convention (30% of commits)**
Custom CLI commit style:
- `[add] tries 2 plan`
- `[add] all the resources from teaching this class 2022-T3`
- `[add] autograder files`
- `[add] dockerize`
- `[fix] typo`
- `[fix] heroku to render`
- `[fix] rm ms` (removing Make School branding)
- `[update] 2022-T3 changes`
- `[rm] logos`
- `[mv] frontend / repeat content to .old for the time being`
- `[cleanup] finalize docsify`

Bracket prefixes used: `[add]`, `[fix]`, `[update]`, `[fixed]`, `[rm]`, `[mv]`, `[cleanup]`

**Pattern C: Freeform (10% of commits)**
- `init ctfcli project`
- `PEP8`
- `fix dates and links`

### Writing Style Characteristics

- All lowercase in bracket prefixes and descriptions
- Terse: 2-6 words typical
- Action-oriented: describes *what* was done, not *why*
- No scope, no body, no extended description
- Pragmatic over ceremonial

---

## Gap Analysis: What the Configuration is Missing

### GAP 1: Commit Style Mismatch (Critical)

**Current config** (CLAUDE.md line 11, git-workflow.md):
```
Conventional commits: feat/fix/refactor/docs/test/chore
```

**Actual practice**: Bracket-prefix convention `[add]`, `[fix]`, `[update]`, `[rm]`, `[mv]`, `[cleanup]` -- all lowercase, terse, what-not-why.

**Impact**: Claude generates commits like `feat(auth): add JWT refresh` when droxey's actual style is `[add] jwt refresh`. Every AI-generated commit looks foreign in the git log.

**Recommendation**: Update CLAUDE.md and git-workflow.md to reflect the bracket-prefix convention, or consciously adopt conventional commits going forward and document the transition. The current config prescribes a style droxey doesn't use.

### GAP 2: No Markdown Authoring Rules (High)

**Evidence**: 80%+ of tech-at-DU commits touch Markdown files. Lesson plans, syllabi, course schedules, tutorial content. This is the dominant file type by an overwhelming margin.

**Current config**: Zero rules or skills for Markdown authoring. No guidance on:
- Lesson plan structure (headers, learning objectives, assignment sections)
- Docsify conventions (`_sidebar.md`, `{docsify-ignore}` markers)
- Course repo README patterns (schedule tables, resource links, grading sections)
- Slide/presentation Markdown (reveal-md)

**Recommendation**: Add `rules/common/markdown.md` covering Docsify conventions and content structure. Add a `skills/course-content/skill.md` for lesson plan and syllabus authoring patterns.

### GAP 3: No Educational Content Creation Context (High)

**Evidence**: The primary job function is creating and maintaining course materials across 40+ repositories. This is the dominant workflow, not software engineering.

**Current config**: Entirely oriented toward software development (Go CLI, Django APIs, Docker). No contexts, templates, or skills for:
- Course repository management
- Syllabus/schedule creation
- Autograder development (Python + Shell + Gradescope)
- Student fork management
- Semester-based content refresh workflow (the `[fix] rm ms` pattern of migrating/rebranding)

**Recommendation**: Add `contexts/teach.md` for educational content mode. Add `templates/course-repo.md` for new course setup. Add `skills/autograder-patterns/skill.md` for Gradescope integration.

### GAP 4: Missing Docsify Patterns (Medium)

**Evidence**: Docsify is used across multiple repos (awesome-teachcode, tocsify npm module, all `_sidebar.md` references). droxey literally wrote an npm module for Docsify TOC generation.

**Current config**: Docsify is not mentioned anywhere.

**Recommendation**: Add Docsify conventions to Markdown rules:
- `_sidebar.md` structure and linking
- `{docsify-ignore}` and `{docsify-ignore-all}` markers
- Directory-based navigation patterns
- `index.html` configuration for Docsify sites

### GAP 5: CapRover Deserves a Dedicated Skill (Medium)

**Evidence**: 4 recent repos (2025-2026) are CapRover deployments: captainclaw, caprover-workadventure, caprover-workadventure-livekit, caprover-workadventure-jitsi. This is an active, recurring pattern.

**Current config**: CapRover gets one line in `rules/common/docker.md`: "CapRover for single-node management. Traefik for routing."

**Recommendation**: Add `skills/caprover-patterns/skill.md` covering:
- captain-definition files
- One-click app configuration
- CapRover + Docker Swarm deployment patterns
- Jinja template patterns for CapRover configs (captainclaw uses Jinja)
- Self-hosted service deployment (LiveKit, Jitsi, WorkAdventure)

### GAP 6: Missing Web3/Blockchain Context (Low)

**Evidence**: shoutouts.eth, getpunk (Go), Token.sol gist, ACS-3240-Decentralized-Apps course with Solidity/Ethereum content.

**Current config**: No Web3 references.

**Recommendation**: If still active, add `skills/web3-patterns/skill.md` for Solidity, Ethereum interaction, and Go/Python Web3 tooling. If dormant, skip -- the config should reflect current practice, not historical interests.

### GAP 7: Missing LLM/Prompt Engineering Patterns (Low-Medium)

**Evidence**: Recent `prompts` repo (system prompts for LLM chat), this `ai` repo, active AI tooling work.

**Current config**: This repo IS the Claude Code config, but no skill exists for prompt engineering patterns, system prompt design, or LLM-specific workflows.

**Recommendation**: Add `skills/prompt-engineering/skill.md` covering system prompt structure, persona design, and the patterns from the `prompts` repo.

### GAP 8: Security Config Misses Offensive/CTF Context (Low)

**Evidence**: Pwnagotchi build (Raspberry Pi), Kali Linux live USB gist, CTF competition config (`ctfcli`), ACS-3230-Web-Security with OWASP/DDoS/Encryption lessons, HiSilicon IP camera research.

**Current config**: `security-review/skill.md` covers defensive web app auditing. No patterns for:
- CTF competition workflow (ctfcli, flag submission)
- Offensive security tooling (Kali, Metasploit, Burp Suite)
- IoT/hardware security research
- Pwnagotchi/WiFi security

**Recommendation**: Add `skills/ctf-workflow/skill.md` if CTF participation is ongoing. The current security skill covers web app auditing well.

### GAP 9: Missing Multi-Repo Batch Operations (Low)

**Evidence**: Managing 40+ repos in tech-at-DU simultaneously. Bulk operations like removing Make School branding across repos, updating semester schedules, refreshing links.

**Current config**: No tooling or patterns for batch repo operations.

**Recommendation**: Consider a `skills/multi-repo-ops/skill.md` with patterns for:
- gh CLI batch operations across org repos
- Semester refresh checklists
- Bulk README/schedule updates

### GAP 10: Writing Voice Not Captured (Medium)

**Evidence**: Commit messages and content consistently show a specific voice:
- Terse, action-oriented
- All lowercase for informal contexts
- Bio: "irl cyberpunk & syntax shaman"
- Docsify sites, not heavyweight documentation
- Pragmatic over ceremonial

**Current config**: CLAUDE.md says "No emojis in code or comments" but doesn't capture the broader writing style for documentation, READMEs, and educational content.

**Recommendation**: Add a brief writing style note to CLAUDE.md or a context:
- Keep prose direct and terse
- Prefer short paragraphs, bullet lists, and tables over long-form explanations
- Use active voice, present tense
- Lowercase in informal contexts (commit messages, inline comments)
- Match the pragmatic, hacker-educator tone of existing content

---

## Priority Matrix

| Priority | Gap | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Commit style mismatch | Low (edit 2 files) | High -- every commit looks wrong |
| P1 | No Markdown authoring rules | Medium (new rule + skill) | High -- dominant file type |
| P1 | No educational content context | Medium (new context + template) | High -- primary workflow |
| P2 | Missing Docsify patterns | Low (add to Markdown rules) | Medium -- used frequently |
| P2 | Writing voice not captured | Low (add to CLAUDE.md) | Medium -- affects all output |
| P2 | CapRover dedicated skill | Medium (new skill) | Medium -- active pattern |
| P3 | LLM/prompt engineering patterns | Medium (new skill) | Low-medium -- emerging interest |
| P3 | Web3/blockchain context | Low (new skill if active) | Low -- possibly dormant |
| P3 | Security/CTF context | Low (new skill) | Low -- occasional activity |
| P3 | Multi-repo batch operations | Medium (new skill) | Low -- infrequent but painful |

---

## Recommended Next Steps

1. **Decide on commit convention**: Either update the config to match the bracket-prefix style (`[add]`, `[fix]`, etc.) or consciously adopt conventional commits. The current mismatch is the most visible gap.

2. **Add Markdown/Docsify rules**: A `rules/common/markdown.md` covering the dominant file type would immediately improve Claude's output quality for the most frequent task.

3. **Add `contexts/teach.md`**: A teaching-mode context would let Claude switch into educational content creation mode with appropriate patterns.

4. **Add `templates/course-repo.md`**: Standardize new course repository setup across tech-at-DU.

5. **Expand CapRover from one line to a skill**: The recent deployment work warrants dedicated patterns.

6. **Add a writing style section**: 2-3 lines in CLAUDE.md capturing the terse, pragmatic voice.

---

## Appendix: Gist Inventory

| # | Description | Files | Date |
|---|-------------|-------|------|
| 1 | HiSilicon IP camera root passwords | password.txt | 2023-12 |
| 2 | Kali Linux Live USB with persistence + WiFi on MacBook Pro | kali_osx_persistence_wifi.md | 2022-12 |
| 3 | Daily WakaTime Update | gistfile1.txt | 2022-02 |
| 4 | PiSugar2 RTC Pwnagotchi | pisugar2-rtc-pwnagotchi.md | 2021-04 |
| 5 | BEW 2.5 SSG MVP v1.0 Solution | makesite.go | 2021-02 |
| 6 | Original Token.sol from brownie token-mix | Token.sol | 2020-09 |
| 7 | Star counter | starcounter.js | 2020-07 |
| 8 | OctoPrint TouchUI LESS defaults | touchui-default.less | 2020-07 |
| 9 | Hemera Extruder Assembly Tips | hemera_extruder_tips_and_gotchas.md | 2020-03 |
| 10 | Weekly WakaTime Stats | development breakdown | 2020-01 |
| 11 | VSCode settings sync | settings, keybindings, extensions | 2019-12 |
| 12 | Jet Celery module (Django plugin) | jet_celery_module.py | 2017-06 |
| 13 | Code Review using Zen of Python | assignment.md, zen.md, zen_walkthrough.py | 2017-05 |
| 14 | Keybase verification | keybase.md | 2016-06 |
