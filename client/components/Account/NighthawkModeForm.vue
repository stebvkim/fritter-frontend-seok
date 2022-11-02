<!-- Form for turning NighthawkMode on or off (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'NighthawkModeForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users/anonymous',
      method: 'DELETE',
      setUsername: true,
      title: 'Toggle NighthawkMode',
      fields: [],
      content: 'In NighthawkMode, your Freets and Comments will be labeled as Anonymous. WARNING: you can only post and comment on public Freets.',
      callback: () => {
        this.$router.push({name: 'Home'}); // Goes to Home page after signing out
        this.$store.commit('alert', {
          message: 'NighthawkMode turned on / off.', status: 'success'
        });
      }
    };
  }
};
</script>
