# changelog

> a cli tool that could generate CHANGELOG.md file base on your git logs by version, maybe it could be one of your automatic tools about your workflow!

## Install

```js
npm i -g @iuv-tools/changelog
```

## Example

```js
changelog -c "feat: use a nice tool to generate CHANGELOG.md" -p -f feat,fix,test,docs
```

## Props

* **commit c**: use git commit, default false
* **push p**: use git push, default false
* **commitFields f**: flag of git commit message, default feat,fix,test,docs
* **repository r**: repository url, default from package.json
* **version v**: new version, default from package.json
