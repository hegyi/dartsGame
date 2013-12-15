var dartsGame = angular.module('dartsGame', []);

dartsGame.service("Game", function() {
  return {
    build: function() {
      var currentGame = {
        participants: [],
        currentParticipant: null,
        currentParticipantIndex: null,
        maxParticipants: 0,
        rounds: [],
        currentRound: 0,
        winnner: null,
        isRunning: false,
        isOver: false,
        currentTotalScore: {}
      }
      return currentGame;
    },
    resetGame: function(dartsGame) {
      dartsGame.isOver = false;
      dartsGame.currentTotalScore = {};
      dartsGame.isRunning = true;
      dartsGame.winner = null;
      dartsGame.currentRound = 0;
      dartsGame.rounds = [];
      init(dartsGame);
    },
    init: function(dartsGame) {
      dartsGame.currentParticipant = dartsGame.participants[0];
      dartsGame.currentParticipantIndex = 0;
    },
    setStarted: function(dartsGame) {
      dartsGame.isRunning = true;
    },
    getScoreFor: function(dartsGame, index, participant) {
      if(dartsGame.rounds[index][participant] != null) {
        return dartsGame.rounds[index][participant].scores;
      }
    },
    updateScoreFor: function(dartsGame, index, participant, scores, total) {
      if(dartsGame.rounds[index][participant] != null) {
        dartsGame.rounds[index][participant].scores = scores;
        dartsGame.rounds[index][participant].total = total;
      }
    },
    addParticipant: function(dartsGame, participant) {
      dartsGame.participants.push(participant);
      dartsGame.maxParticipants += 1;
    },
    addScore: function(dartsGame, score) {
      var currentParticipant = dartsGame.currentParticipant;
      if(dartsGame.rounds[dartsGame.currentRound] == null) {
        dartsGame.rounds[dartsGame.currentRound] = {}
      }
      if(dartsGame.rounds[dartsGame.currentRound][currentParticipant] == null) {
        dartsGame.rounds[dartsGame.currentRound][currentParticipant] = { scores: [], total: 0}
      }
      dartsGame.rounds[dartsGame.currentRound][currentParticipant].scores.push(parseInt(score));
      dartsGame.rounds[dartsGame.currentRound][currentParticipant].total += parseInt(score);
      if(dartsGame.rounds[dartsGame.currentRound][currentParticipant].scores.length == 3) {
        if(dartsGame.currentParticipantIndex == dartsGame.maxParticipants - 1) {
          dartsGame.currentRound += 1;
        }
        var newIndex = null;
        if(dartsGame.currentParticipantIndex == dartsGame.maxParticipants - 1) {
          newIndex = 0;
        } else {
          newIndex = dartsGame.currentParticipantIndex += 1;
        }
        dartsGame.currentParticipantIndex = newIndex;
        dartsGame.currentParticipant = dartsGame.participants[newIndex];
      }
    },
    calculateTotal: function(dartsGame) {
      dartsGame.currentTotalScore = {};
      dartsGame.rounds.forEach(function(round) {
        for(key in round) {
          if(typeof round[key] == "object") {
            if(dartsGame.currentTotalScore[key] == null) {
              dartsGame.currentTotalScore[key] = round[key].total;
            } else {
              dartsGame.currentTotalScore[key] += round[key].total;
            }
            if(dartsGame.currentTotalScore[key] == 501) {
              dartsGame.winner = key;
              dartsGame.isOver = true;
            }

          }
        }
      });
    }

  }


});

dartsGame.controller('ParticipantsController', ['$scope', '$rootScope', 'Game', function($scope, $rootScope, Game) {
  $scope.title = "Darts Game";
  $rootScope.dartsGame = Game.build();
  var dartsGame = $rootScope.dartsGame;

  $scope.addParticipant = function(newParticipant) {
    Game.addParticipant(dartsGame, newParticipant);
    $scope.newParticipant = "";
  }

  $scope.startGame = function() {
    Game.setStarted(dartsGame);
  }

}]);

dartsGame.controller('GameController', ['$scope', '$rootScope', 'Game', function($scope, $rootScope, Game) {

  $scope.showEditScoreField = false;
  $scope.editScore = {}
  var dartsGame = $rootScope.dartsGame;
  Game.init(dartsGame);

  $scope.formatScore = function(scores) {
    return scores.join(", ");
  }

  $scope.addScore = function(score) {
    Game.addScore(dartsGame, score);
    Game.calculateTotal(dartsGame);
    $scope.currentScore = null;
  }

  $scope.editScore = function(roundIndex, participant) {
    $scope.showEditScoreField = true;

    $scope.editScoreValues = {
      participant: participant,
      roundIndex: roundIndex,
      scores: []
    }

    var scores = Game.getScoreFor(dartsGame, roundIndex, participant);
    scores.forEach(function(val) {
      $scope.editScoreValues.scores.push({value: val});
    });
  }

  $scope.saveScore = function() {
    var roundIndex = $scope.editScoreValues.roundIndex;
    var participant = $scope.editScoreValues.participant;
    var scores = [];
    var total = 0;
    $scope.editScoreValues.scores.forEach(function(score) {
      scores.push(score.value);
      total += score.value;
    });
    Game.updateScoreFor(dartsGame, roundIndex, participant, scores, total);
    Game.calculateTotal(dartsGame);
    $scope.showEditScoreField = false;
    $scope.editScoreValues = {};
  }

  $scope.cancelEditScore = function() {
    $scope.showEditScoreField = false;
    $scope.editScoreValues = {};
  }

  $scope.startNewGame = function() {
    Game.resetGame(dartsGame);
  }

}]);
