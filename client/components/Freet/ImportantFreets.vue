<!-- Default page that also displays freets -->

<template>
    <main>
      <section v-if="$store.state.username">
        <header>
            <div>
                <h2 id="important-freets">Important Freets for @{{ $store.state.username }}</h2>
            </div>
        </header>

        <section
          v-if="$store.state.freets.length"
        >
          <FreetComponent
            v-for="freet in $store.state.freets"
            :key="freet.id"
            :freet="freet"
          />
        </section>
        <article
          v-else
        >
          <h3>No important freets found.</h3>
        </article>
      </section>
    </main>
  </template>
  
  <script>
  import FreetComponent from '@/components/Freet/FreetComponent.vue';
  
  export default {
    name: 'ImportantFreets',
    components: {FreetComponent},
  };
  </script>
  
  <style scoped>
  section {
    display: flex;
    flex-direction: column;
    background-color: rgb(255, 119, 119);
  }
  
  header, header > * {
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  section .scrollbox {
    flex: 1 0 50vh;
    padding: 3%;
    overflow-y: scroll;
  }
  
  #important-freets {
    padding-left: 10%;
    white-space: nowrap;
  }

  </style>
  