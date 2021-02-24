# release

> a step by step cli tool for release npm packages

## Install

```js
npm i -g @all-in-js/release
```

## Example

```js
release --step lint,test,build
```

## Props

* **gittag gt**: use git tag
* **branch b**: check current branch
* **scripts s step**: some steps, from npm scripts
* **afterAllScripts e end**: some scripts after bpm publish
