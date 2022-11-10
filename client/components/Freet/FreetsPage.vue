<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2 v-if="$store.state.username === 'Anonymous'">Welcome. You are in NighthawkMode, and your actions will show up as @Anonymous. 🦇🐱‍👤</h2>
        <h2 v-else>Welcome back, @{{ $store.state.username }}</h2>
      </header>
      <CreateFreetForm/>
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to view, create, edit, and delete freets.
        </h3>
      </article>
    </section>
    
    <section v-if="$store.state.username">
      <header>

        <div class="left" id="important-freets">
          <h2>Important Freets for @{{ $store.state.username }}</h2>
        </div>
      </header>
      <section
        v-if="$store.state.importantFreets.length"
      >
        <FreetComponent
          v-for="freet in $store.state.importantFreets"
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

    <br>

    <section v-if="$store.state.username">
      <header>
        <div class="left" id="on-this-day">
          <h2>Freets made by @{{$store.state.username}} on this day</h2>
        </div>
      </header>
      <section
        v-if="$store.state.onThisDayFreets.length"
      >
        <h1>Something was found!</h1>
        <FreetComponent
          v-for="freet in $store.state.freets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found on this day from previous years.</h3>
      </article>
    </section>
    
    <br>

    <section v-if="$store.state.username">
      <header>
        <div class="left" id="following-feed">
          <h2>
            Freets from Freeters you follow
          </h2>
        </div>
      </header>

      <section
        v-if="$store.state.followingFreets.length"
      >
        <FreetComponent
          v-for="freet in $store.state.followingFreets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
    </section>

    <hr id = "line">
    <br>

    <section v-if="$store.state.username">
      <header>
        <div class="left" id="general-freets">
          <h2>
            All Freets
            <span v-if="$store.state.filter">
              by @{{ $store.state.filter }}
            </span>
          </h2>
        </div>
        <div class="right">
          <GetFreetsForm
            ref="getFreetsForm"
            value="author"
            placeholder="🔍 Filter by author (optional)"
            button="🔄 Get freets"
          />
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
        <h3>No freets found.</h3>
      </article>
    </section>


  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';
import GetFreetsForm from '@/components/Freet/GetFreetsForm.vue';
import ImportantFreets from '@/components/Freet/ImportantFreets.vue';
import OnThisDay from '@/components/Freet/OnThisDay.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, GetFreetsForm, CreateFreetForm, ImportantFreets, OnThisDay},

  beforeMount() {
    this.$refs.getFreetsForm.relevant();
  },

  mounted() {
    this.$refs.getFreetsForm.submit();
    this.$refs.getFreetsForm.relevant();
  },


};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}

#line {
  width:100%;
  height: 5px;
  color: black;
  background-color: black;
  margin-left:0
}

#on-this-day {
  width: 100vw;
  border-style: solid;
  border-width: thin;
  border-radius: 25px;
  padding-left: 2%;
  white-space: nowrap;
  background-color: rgb(238, 255, 110);
}

#important-freets {
  width: 100vw;
  border-style: solid;
  border-width: thin;
  border-radius: 25px;
  padding-left: 2%;
  white-space: nowrap;
  background-color: rgb(255, 97, 97);
}

#following-feed {
  width: 100vw;
  border-style: solid;
  border-width: thin;
  border-radius: 25px;
  padding-left: 2%;
  white-space: nowrap;
  background-color: rgb(101, 255, 135);
}

#general-freets {
  width: 100vw;
  border-style: solid;
  border-width: thin;
  border-radius: 25px;
  padding-left: 2%;
  white-space: nowrap;
  background-color: rgb(102, 92, 241);
}
</style>
