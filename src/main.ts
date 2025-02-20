type friendItem = {
  name: string;
  hobbies: string[];
};

type userItem = {
  id: number;
  name: string;
  city: string;
  age: number;
  friends: friendItem[];
};

export default async function main() {
  const response = await fetch(process.argv.slice(2));
  const raw = await response.text();

  // Commas are missing between objects in the list.
  const users: userItem[] = JSON.parse(
    "[" + raw.replace(/}\s*{/g, "},{") + "]"
  );

  console.log("users count:", users.length);

  const reducedUserData = users.reduce(
    (result, user: any) => {
      if (user.age) {
        // Get data for age calculation.
        if (result.ages[user.city]) {
          result.ages[user.city].sum += user.age;
          result.ages[user.city].users++;
        } else {
          result.ages[user.city] = {
            sum: user.age,
            users: 1,
          };
        }
      }

      if (user.friends && user.friends.length) {
        // Get data for friends calculation.
        if (result.friends[user.city]) {
          result.friends[user.city].sum += user.friends.length;
          result.friends[user.city].users++;

          // Get data for most friends per city calculation.
          if (
            user.friends.length > result.friends[user.city].mostFriends.count
          ) {
            result.friends[user.city].mostFriends.userIds = [user.id];
            result.friends[user.city].mostFriends.count = user.friends.length;
          } else if (
            user.friends.length === result.friends[user.city].mostFriends.count
          ) {
            result.friends[user.city].mostFriends.userIds.push(user.id);
          }
        } else {
          result.friends[user.city] = {
            sum: user.friends.length,
            users: 1,
            mostFriends: {
              userIds: [user.id], // Allow multiple to account for a tie.
              count: user.friends.length,
            },
          };
        }

        // Most common hobbies.
        user.friends.reduce((hobbies, friend) => {
          if (friend.hobbies && friend.hobbies.length) {
            friend.hobbies.forEach((hobby) => {
              if (hobbies[hobby]) {
                hobbies[hobby]++;
              } else {
                hobbies[hobby] = 1;
              }
            });
          }
          return hobbies;
        }, result.hobbies);
      }

      // Most common first name.
      if (user.name) {
        if (result.names[user.name]) {
          result.names[user.name]++;
        } else {
          result.names[user.name] = 1;
        }
      }

      return result;
    },
    {
      ages: {},
      friends: {},
      names: {},
      hobbies: {},
    }
  );

  const averageAgePerCity = {};
  Object.keys(reducedUserData.ages).forEach((city) => {
    averageAgePerCity[city] = Math.floor(
      reducedUserData.ages[city].sum / reducedUserData.ages[city].users
    );
  });

  const averageFriendsPerCity = {};
  const userWithMostFriendsPerCity = {};
  Object.keys(reducedUserData.friends).forEach((city) => {
    averageFriendsPerCity[city] = Math.floor(
      reducedUserData.friends[city].sum / reducedUserData.friends[city].users
    );

    userWithMostFriendsPerCity[city] =
      reducedUserData.friends[city].mostFriends.userIds;
  });

  const mostCommonName = Object.entries(reducedUserData.names).sort(
    ([, a], [, b]) => a - b
  )[0];

  const mostCommonHobby = Object.entries(reducedUserData.hobbies).sort(
    ([, a], [, b]) => a - b
  )[0];

  const result = {
    averageAgePerCity,
    averageFriendsPerCity,
    userWithMostFriendsPerCity,
    mostCommonName,
    mostCommonHobby,
  };

  console.log(result);
  return result;
}

main();
