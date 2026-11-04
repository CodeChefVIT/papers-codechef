# Contribute to the Papers Repository

We appreciate your interest in contributing to the `papers-codechef` repository! Please follow these guidelines to ensure a smooth and effective contribution process.


## Getting started

- If you're looking for ideas about what to work on, check out our [issues](https://github.com/CodeChefVIT/papers-codechef/issues) 
- If you have a bugfix to report ensure that you are on the latest pkull and no similar issue exists. You can then [create an bug report](https://github.com/CodeChefVIT/papers-codechef/issues/new?template=bug_report.md)
- You can also propose a [feature request](https://github.com/CodeChefVIT/papers-codechef/issues/new?template=feature_request.md). Begin by filling out the template, write a brief problem statement that clearly explains the issue you want to address, without tying it to any specific solution. It doesn’t need to be long or formal; just provide enough context to clearly understand the problem before discussing possible solutions. 

## Setting up
- **Fork** the repository. All the PRs would be made from this fork.
- **Clone** the repository.

To get the project running, you need to set up your local environment:

- **Create a `.env` file:** Create a new file named `.env` and use the `.env.example` file to create your own .env file and put in your your own environment variables to make the project functional.
- **Install dependencies:** Run `pnpm i` in your terminal to install all necessary dependencies.
- **Checkout staging branch**: Run `git checkout staging` to switch branches.
- **Run the project:** Run `pnpm dev` to start the project.

## How to Contribute

Once your environment is set up, you're ready to start coding.

- **Create a new branch:** Use the command `git checkout -b yourName/featureName` to create a new branch for your work.
- **Make your changes:** Write the code to address the issue you were assigned.
- **Add changed files:** After making your changes, use `git add .` to add the modified files to Git tracking.
- **Commit your changes:** Please follow standard conventional commit guidelines as outlined here: https://www.conventionalcommits.org/en/v1.0.0/
- **Push your changes:** Push your commits to your forked repository using `git push`.

## Submit a Pull Request

- **[Submit your pull request](https://github.com/CodeChefVIT/papers-codechef/compare):** Please, fill in the Pull Request template - it will help us better understand the PR and increase the chances of it getting merged quickly.

An organization member will review the PR and discuss changes you might have to make before merging it. Any new changes you push to your branch will be automatically attached to the PR.

---

### Mandatory PR contents

Please ensure that any Pull Request you make contains these things -

- Purpose and issue which the PR is made for.
- Before & after screenshots if your changes involve any visual adjustments (e.g. UI changes, layout tweaks).
- List of the major changes made in this PR.
- Mention of any bug fixes, known issues or follow-ups needed.

**Important:** Ensure no merge conflicts exist before making a PR and run `pnpm build` to check for build errors.


### Tips to improve the chances of your PR getting reviewed and merged

- Small, focused & incremental pull requests are much easier to review.
- Spend time explaining your changes in the pull request body.
- Low effort PRs, such as those that just re-arrange syntax, won't be merged without a compelling justification.
