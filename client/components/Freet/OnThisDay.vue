<!-- Default page that also displays freets -->

<template>
    <main>
      <section v-if="$store.state.username">
        <header>
            <div>
                <h2 id="on-this-day">Freets made by @{{$store.state.username}} on this day</h2>
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
          <h3>No OnThisDay Freets found.</h3>
        </article>
      </section>
    </main>
  </template>
  
  <script>
  import FreetComponent from '@/components/Freet/FreetComponent.vue';
  
  export default {
    name: 'OnThisDay',
    components: {FreetComponent},
  };
  </script>
  
  <style scoped>
  section {
    display: flex;
    flex-direction: column;
    background-color: rgb(243, 255, 148);
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
  
  #on-this-day {
    padding-left: 5%;
    white-space: nowrap;
  }

  </style>
  