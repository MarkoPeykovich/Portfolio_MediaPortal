<template>
  <div>
    <div v-if="!user" class="home">
      <img alt="Vue logo" src="../assets/logo.png" id="slika">
      <HelloWorld msg="Welcome to the application MediaPortal by Marko Pejkovic"/>
    </div> 
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  props: ['user'],
  name: 'Home',
  components: {
    HelloWorld
  }
}
</script>

<style>
  #slika {
    margin-right: 125px;
  }
</style>
