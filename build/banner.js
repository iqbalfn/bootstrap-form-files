'use strict'

const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * Bootstrap Form Files v0.0.2 (https://iqbalfn.github.io/bootstrap-form-files/)
  * Copyright 2019 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/bootstrap-form-files/blob/master/LICENSE)
  */`
}

module.exports = getBanner
