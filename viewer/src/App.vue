<template>
  <div id="app">
    <Feed />
  </div>
</template>

<script>
import Feed from './components/Feed'

export default {
  name: 'App',
  components: { Feed }
}
</script>

<style>
    body {
      background-color: black;
      margin: 0;
      padding: 0;
    }
    #app {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
    }
</style>
