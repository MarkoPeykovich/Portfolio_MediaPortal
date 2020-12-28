<template>
  <div id="app">
    <navigation :rubr="rubrika" @ru="saveRu" @clru="clearRu" ></navigation>
    <router-view :rubr="rubrika" @ru="saveRu" @clru="clearRu" @changekey="forceRerender" :key="componentKey" />
  </div>
</template>
                                    
<script>
import Nav from './components/Nav.vue';

export default {
  components: {
    'navigation': Nav
  },
  data: function() {
      return { 
        rubrika: null,
        componentKey: 0
        // :key="$route.fullPath" 
      }
    },
  methods: {
    saveRu(rubrika) {
      this.rubrika = rubrika;
    },
    clearRu() {
      this.rubrika = null;
    },
     forceRerender() {
        this.componentKey += 1;
      }
   },
   created() {
    if(this.$route.path == '/IzabranaRubrika') {
      if(performance.navigation.type == 1) {
        this.$router.go(-1);  
      }
    }
  }
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
