const bcrypt = require('bcrypt');
const { requireCompetition, requireCompetitionWithAuthorization } = require('./middleware');
const competitionLoader = require('../competition-loader');
const pubsub = require('./pubsub');
const { roundById } = require('../utils/wcif');
const { updateResult } = require('../utils/results');
const { openRound, clearRound, quitCompetitor, addCompetitor } = require('../utils/rounds');
const { importCompetition, synchronize, updateAccessSettings } = require('../utils/competition');
const { withWcif } = require('./utils');

module.exports = {
  signOut: async (parent, args, { session }) => {
    session.destroy();
    return true;
  },
  importCompetition: async (parent, { id }, context) => {
    if (!context.user) throw new AuthenticationError('Not authorized.');
    return await importCompetition(id, context.user);
  },
  synchronize: async (parent, { competitionId }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedCompetition = await synchronize(competition);
      return await competitionLoader.update(updatedCompetition);
    });
  },
  updateAccessSettings: async (parent, { competitionId, accessSettings }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'manager', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedCompetition = await updateAccessSettings(competition, accessSettings);
      return await competitionLoader.update(updatedCompetition);
    });
  },
  signIn: async (parent, { competitionId, password }, { session }) => {
    const competition = await requireCompetition(competitionId);
    if (competition.encryptedPassword === null) {
      throw new Error(`The competition doesn't use password authentication.`);
    }
    const authenticated = await bcrypt.compare(password, competition.encryptedPassword);
    if (authenticated) {
      session.competitionId = competition._id;
      session.encryptedPassword = competition.encryptedPassword;
    }
    return authenticated;
  },
  updateResult: async (parent, { competitionId, roundId, result }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const attempts = result.attempts.map(attempt => ({ result: attempt }));
      const personId = parseInt(result.personId, 10);
      const updatedWcif = updateResult(competition.wcif, roundId, personId, attempts);
      const updatedRound = roundById(updatedWcif, roundId);
      const updatedRoundWithWcif = withWcif(updatedWcif)(updatedRound);
      pubsub.publish('ROUND_UPDATE', { roundUpdate: updatedRoundWithWcif, competitionId, roundId });
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return updatedRoundWithWcif;
    });
  },
  openRound: async (parent, { competitionId, roundId }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = openRound(competition.wcif, roundId);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  clearRound: async (parent, { competitionId, roundId }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = clearRound(competition.wcif, roundId);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  quitCompetitor: async (parent, { competitionId, roundId, competitorId, replace }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = quitCompetitor(competition.wcif, roundId, parseInt(competitorId, 10), replace);
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
  addCompetitor: async (parent, { competitionId, roundId, competitorId }, { user, session }) => {
    const competition = requireCompetitionWithAuthorization(competitionId, 'scoretaker', user, session);
    return await competitionLoader.executeTask(competitionId, async () => {
      const competition = await competitionLoader.get(competitionId);
      const updatedWcif = addCompetitor(competition.wcif, roundId, parseInt(competitorId, 10));
      await competitionLoader.update(
        { ...competition, wcif: updatedWcif },
        { resultsOnly: true }
      );
      return withWcif(updatedWcif)(roundById(updatedWcif, roundId));
    });
  },
};
