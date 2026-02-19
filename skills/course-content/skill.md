# Course Content

Patterns for educational content creation across course repositories.

## Lesson Plan Structure

```markdown
# [Topic Title]

## Learning Objectives
By the end of this lesson, students will be able to:
1. [Measurable verb] [specific outcome]
2. [Measurable verb] [specific outcome]

## Overview
[2-3 sentence context for this topic.]

## [Section 1: Concept]
[Explanation with code examples.]

## [Section 2: Activity]
[Hands-on exercise with clear instructions.]

## [Section 3: Stretch Challenges]
[Optional advanced exercises for fast finishers.]

## Resources
- [Resource](url) - [one-line description]
```

Use Bloom's taxonomy verbs for objectives: identify, explain, implement, analyze, design, evaluate.

## Docsify Site Setup

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: 'Course Title',
      repo: 'Tech-at-DU/repo-name',
      loadSidebar: true,
      subMaxLevel: 2,
      auto2top: true
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-copy-code"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs/components/prism-python.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs/components/prism-go.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs/components/prism-bash.min.js"></script>
</body>
</html>
```

## Sidebar Navigation

```markdown
<!-- _sidebar.md -->
- **Course Info**
  - [Syllabus](README.md)
  - [Schedule](README.md#schedule)
  - [Resources](Resources/README.md)

- **Lessons**
  - [Topic 1](Lessons/Topic1.md)
  - [Topic 2](Lessons/Topic2.md)

- **Assignments**
  - [Assignment 1](Assignments/Assignment1.md)
```

## Autograder Patterns (Gradescope)

```
autograder/
  setup.sh              # install dependencies
  run_autograder        # main entry point
  tests/
    test_submission.py  # pytest tests against student code
  requirements.txt      # autograder dependencies
```

```bash
#!/bin/bash
# setup.sh
apt-get update && apt-get install -y python3-pip
pip3 install -r /autograder/source/requirements.txt
```

```bash
#!/bin/bash
# run_autograder
cd /autograder/source
python3 -m pytest tests/ --json-report --json-report-file=/autograder/results/results.json
```

## Semester Refresh Checklist

- Update dates in schedule table
- Check all external links still resolve
- Update assignment due dates
- Refresh starter code repo links (ensure forks point to current org)
- Remove prior semester announcements
- Update `_sidebar.md` if lesson order changed
- Run `tocsify` if using generated TOC

## Student Fork Workflow

Document in README:
1. Fork the repo
2. Clone the fork locally
3. Add upstream remote: `git remote add upstream [org-repo-url]`
4. Sync before each assignment: `git pull upstream main`
5. Push work to fork, submit via Gradescope or PR
