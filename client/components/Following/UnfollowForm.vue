<!-- Form for turning NighthawkMode on or off (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'FollowForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users/followers',
      method: 'DELETE',
      hasBody: true,
      setUsername: false,
      title: 'Unfollow user',
      fields: [
        {id: 'user', label: 'Username', value: ''}
      ],
      content: 'Unfollow:',
      callback: () => {
        this.$router.push({name: 'Home'}); // Goes to Home page after signing out
        this.$store.commit('alert', {
          message: 'Successfully unfollowed user.', status: 'success'
        });
      }
    };
  }
};
</script>
